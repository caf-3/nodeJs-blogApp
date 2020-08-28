if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI : 'AtlasURI'}
    
}else{
    module.exports = {mongoURI : 'mongodb://localhost/blogApp'}
}
