const path = require('path');

module.exports = {
    entry:{
        main: './app.js'
    },
    output:{
        path:path.join(__dirname,'Development'),
        publicPath:'/',
        filename:'[name].js',
        clean:true
    },
    mode:'development',
    target:'node',
    module:{
        rules:[
            {
                test:/\.js$/,
                exclude:/node_modules/,
                loader:"babel-loader"
            }
        ]
    }
}