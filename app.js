// Exportación de librerías   
import express from 'express';  
import session from 'express-session';  
import bodyParser from 'body-parser';  
import { v4 as uuidv4 } from 'uuid';  
import os from 'os';  

const app = express();  
const PORT = 3500;  

app.listen(PORT, () => {  
    console.log(`Server iniciado en http://localhost:${PORT}`);  
});  

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));  

// Sesiones almacenadas en memoria RAM   
const sessions = {};  
app.use(session({  
    secret: "P4-ADLN#mcqueen-sesionesHTTP-VariablesDeSesion",  
    resave: false,  
    saveUninitialized: true,  
    cookie: { maxAge: 5 * 60 * 1000 }  
}));  

app.get('/', (req, res) => {  
    return res.status(200).json({  
        message: 'Bienvenido al API de control de Sesiones',  
        author: 'Ana Daniela Lopez Neri'  
    });  
});  

// Función de utilidad que nos permite acceder a la información de la interfaz de red   
const getLocalIp = () => {  
    const networkInterfaces = os.networkInterfaces();  
    for (const interfaceName in networkInterfaces) {  
        const interfaces = networkInterfaces[interfaceName];  
        for (const iface of interfaces) {  
            // Verificamos si la interfaz es interna y si es IPv4  
            if (iface.family === "IPv4" && !iface.internal) {  
                return iface.address;  
            }  
        }  
    }  
    return null; // Retornamos null si no se encuentra una interfaz de red válida   
};  

app.post('/login', (req, res) => {  
    const { email, nickname, macAddress } = req.body;  
    if (!email || !nickname || !macAddress) {  
        return res.status(400).json({  
            message: "Se esperan campos requeridos"  
        });  
    }  
    const sessionId = uuidv4();  
    const now = new Date();  

    sessions[sessionId] = {  
        sessionId,  
        email,  
        nickname,  
        macAddress,  
        ip: getLocalIp(),  
        createdAt: now,  
        lastAccessedAt: now  
    };  

    res.status(200).json({  
        message: "Inicio de sesión exitoso",  
        sessionId  
    });  
});  

app.post("/logout", (req, res) => {  
    const { sessionId } = req.body;  
    if (!sessionId || !sessions[sessionId]) {  
        return res.status(404).json({  
            message: "No se ha encontrado una sesión activa."  
        });  
    }  
    delete sessions[sessionId];  
    res.status(200).json({  
        message: "Logout echo"  
    });  
});  

app.post("/update", (req, res) => {  
    // Implementar lógica de actualización aquí  
    const{sessionId}=req.body;

    if(!sessionId || !sessions[sessionId]){
        return res.status(404).json({message:"No hay sesiones activas"});
    }
    sessions[sessionId].lastAccess =new Date();
    res.send({message:'Usr updated succesfully.', session:req.session})
});  

app.get("/status", (req, res) => {  
    const sessionId = req.query.sessionId;  
    if (!sessionId || !sessions[sessionId]) {  
        return res.status(404).json({  
            message: "No hay una sesión activa"  
        });  
    }  

    res.status(200).json({  
        message: "Sesión actualizada correctamente",  
        session: sessions[sessionId]  
    });  
});