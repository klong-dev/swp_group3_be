const Item = require("../models/Item");


class ItemController{
    getListItems = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit; 

            const listItem = await Item.findAndCountAll({
                limit: limit,
                offset: offset
            });
            const totalPages = Math.ceil(listItem.count / limit);
            return res.status(200).json({
                error_code: 0,
                listItem: listItem.rows,
                totalItems: listItem.count,
                totalPages: totalPages,
                currentPage: page
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error_code: 1, message: "ERROR", error });
        }
    }
    
}

module.exports = new ItemController();