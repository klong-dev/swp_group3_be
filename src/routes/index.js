const payment = requir("./payment")
function routes(app) {
    app.use("/payment", payment)
}

module.exports = routes;