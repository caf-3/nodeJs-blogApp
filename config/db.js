if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI : 'mongodb+srv://AltasServer:<atltasPassWord>@blogapp.qfsic.mongodb.net/AtlasServer?retryWrites=true&w=majority'}
    
}else{
    module.exports = {mongoURI : 'mongodb://localhost/blogApp'}
}