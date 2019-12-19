if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://cristianolima2309:cristiano_23lima@cluster0-2sba8.mongodb.net/test?retryWrites=true&w=majority"
    }
}else{
    module.exports = {
        mongoURI: "mongodb://localhost/blogapp"
    }
}