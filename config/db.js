if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI : 'mongodb+srv://blogapp:<matsolo33>@blogapp.qfsic.mongodb.net/<blogapp>?retryWrites=true&w=majority'}
}else{
    module.exports = {mongoURI : 'mongodb://localhost/blogApp'}
}