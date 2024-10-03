const express = require("express");
let router = express.Router();
var catalogModel = require("../../models/catalog")

router.get("/", async(req,res) => {
    let catalogs = await catalogModel.find();
    return res.send(catalogs);
});

router.get("/:id", async(req,res) => {
    try{
        const catalogId = req.params.id;
        let catalog = await catalogModel.findOne({ Id: catalogId });

        if(!catalog) return res.status(400).send("Cattle with given Id is not present.")
            
        return res.send(catalog);
    } 
    catch(err){
        console.error("Error occurred:", err); 
        return res.status(400).send("Invalid Id");
    }
});

router.put('/:id', async (req, res) => {
    try {
        const catalogId = req.params.id;
        const { Sex, Color, Breed, Age, Height, Weight } = req.body;

        const updatedCatalog = await catalogModel.findOneAndUpdate(
            { Id: catalogId }, // Search criteria
            { Sex, Color, Breed, Age, Height, Weight },    // Fields to update
            { new: true }      // Return the updated document
        );

        if (!updatedCatalog) {
            return res.status(404).send({ message: 'Catalog item not found' });
        }

        res.status(200).send(updatedCatalog);
    } catch (error) {
        res.status(500).send({ message: 'Error updating catalog item', error });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const catalogId = req.params.id;

        const deletedCatalog = await catalogModel.findOneAndDelete({ Id: catalogId });

        if (!deletedCatalog) {
            return res.status(404).send({ message: 'Catalog item not found' });
        }

        res.status(200).send({ message: 'Catalog item deleted successfully', deletedCatalog });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting catalog item', error });
    }
});

router.post("/", async (req, res) => {
    try {
        const { Id, Sex, Color, Breed, Age, Height, Weight } = req.body;

        // Create a new catalog item using the provided data
        let newCatalog = new catalogModel({
            Id,
            Sex,
            Color,
            Breed,
            Age,
            Height,
            Weight
        });

        // Save the new catalog item to the database
        await newCatalog.save();

        // Return the newly created catalog item
        return res.status(201).send(newCatalog);
    } catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send("Error creating catalog item");
    }
});

module.exports = router;