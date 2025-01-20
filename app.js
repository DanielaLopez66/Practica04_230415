import express, {request, response} from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import {v4 as uuidv4} from 'uuid';
import os from 'os';
import { connect } from 'http2';


const app = express();
const PORT =3500;

app.listen(PORT, ()=>{
    console.log(`Servidor iniciado en http://localhost:${PORT}`)

})
app.use(express.json())
app.use(express.urlencoded({extended:true}));
//Sesiones almacenadas

const sessions = {};
app.use(
    session({
        secret: "p4-ADLN#mcqueen-SesionesHTTP-VariablesDeSesion",
        resave: false,
        saveUninitialized: false,
        cookie:{maxAge : 5* 60* 1000}
    })
)

app.get('/', (req, res)=>{
    return res.status(200).json({
        message:'Bienvenid@ a la API de Control de Sesiones',
        author:'Ana Daniela López Neri'
    })
})
const getLocalIp = ()=> {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces){
        const interfaces = networkInterfaces[interfaceName];
        for(const iface of interfaces){
            //IPv4 y no interna
            if(iface.famil=== "IPv4"&& !iface.internal){
                return iface.address;
            }
        }
    }
    return null; //Retorna null si no encuentra una IP valida 
};
app.post('/login', (request,res)=>{
    const{email, nickname,macaAddress}=request.body;
    if(!email|| !nickname || !macaAddress){
        return response.status(400).json({
            message:'Faltan parametros'
        })
    }
    const sessionId =uuidv4();
    const now = new Date();

    sessions[sessionId]={
        sessionId,
        email,
        nickname,
        macaAddress,
        ip:getLocalIp(request),
        createAt:now,
        lastAccessedAt:now,
    };
    res.status(200).json({
        message:'Sesion iniciada',
        sessionId
    });
});



app.post("/logout",(request, res)=>{
    const {sessionId} =request.body;

    if(!sessionId || !sessions [sessionId]){
        return response.status(400).json({
            message: 'no se encontraron una sesion activa'
        });
    }
    delete sessions[sessionId];
    request.session.destroy((err)=>{
        if(err){
            return response.status(500).send({message:'Error al cerrar la sesion'})
        }
    })
    response.status(200).json({message:"Logout successful"})
})
app.post("/update", (req, res)=>{
    const { sessionId, email, nickname}=request.body;

    if(!sessionId|| !sessions[sessionId]){
        response.status(404).json({message: "No existe una sesion activa"})
    }
    if(email)sessions[sessionId].email = email;
    if(nickname)sessions[sessionId].nickname=nickname;
    IdleDeadline()
    sessions[sessionId].lastAcceses = newDate();

})

app.get("/status",(req, res)=>{
    const sessionId=request.query.sessionId;
    if(!sessionId||!sessions[sessionId]){
        response.status(400).json({message:"No hay"})
    }
    response.status(200).json({
        message:"Sesion activa",
        session:sessions[sessionId]
    });
});
