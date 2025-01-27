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

// Sesiones almacenadas con express-session   
app.use(session({  
    secret: "P4-ADLN#mcqueen-sesionesHTTP-VariablesDeSesion",  
    resave: false,  
    saveUninitialized: true,  
    cookie: { 
        maxAge: 5 * 60 * 1000,  // 5 minutos
        httpOnly: true,  // Seguridad adicional
        secure: false // Cambiar a 'true' si usas HTTPS
    }  
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

// Ruta de login que crea una nueva sesión
app.post('/login', (req, res) => {  
    const { email, nickname, macAddress } = req.body;  

    if (!email || !nickname || !macAddress) {  
        return res.status(400).json({  
            message: "Se esperan campos requeridos"  
        });  
    }  
// Crear una nueva sesión
    req.session.email = email;
    req.session.nickname = nickname;
    req.session.macAddress = macAddress;
    req.session.ip = getLocalIp();
    req.session.createdAt = new Date();
    req.session.lastAccessedAt = new Date();

    res.status(200).json({  
        message: "Inicio de sesión exitoso",  
        sessionId: req.sessionID 
    });  
});  

// Ruta de logout que elimina la sesión activa
app.post("/logout", (req, res) => {  
    const { sessionId } = req.body;  // Verificar si se proporcionó un ID de sesión

    if (!req.session || !req.sessionID) {  
        return res.status(404).json({  
            message: "No se ha encontrado una sesión activa."  
        });  
    }  

    // Borrar la sesión
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "Error al destruir la sesión",
                error: err
            });
        }
        res.status(200).json({  
            message: "Logout exitoso"  
        });
    });
});  

app.post("/update", (req, res) => {  
    const { email, nickname } = req.body;

    if (!req.session || !req.sessionID) {
        return res.status(404).json({ message: "No existe una sesión activa." });
    }

    if (email) req.session.email = email;// Actualizar el nickname
    if (nickname) req.session.nickname = nickname;// Actualizar la fecha de último acceso
    req.session.lastAccessedAt = new Date();

    res.status(200).json({
        message: "Sesión actualizada correctamente.",
        session: req.session,
    });
});  


app.get("/status", (req, res) => {
    if (!req.session || !req.sessionID) {
        return res.status(404).json({
            message: "No hay una sesión activa"
        });
    }

    const now = new Date();
    const idleTime = (now - new Date(req.session.lastAccessedAt)) / 1000; // Tiempo de inactividad
    const duration = (now - new Date(req.session.createdAt)) / 1000; // Duración total

    res.status(200).json({
        message: "Sesión activa",
        session: req.session,
        idleTime: `${idleTime} segundos`,
        duration: `${duration} segundos`
    });
});



