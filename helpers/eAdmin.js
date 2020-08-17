module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }else{
            //req.flash('error_msg', "Voçe precisa estar logado para entrar");
            req.flash('error_msg', "Area restrita...");
            res.redirect('/');
        }
    }
}