const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const connect = await mongoose.connect("mongodb+srv://blog:blog@cluster0.cwf9ud0.mongodb.net/?retryWrites=true&w=majority");
        console.log("Database connected!",
            connect.connection.host,
            connect.connection.name
        );
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDb;