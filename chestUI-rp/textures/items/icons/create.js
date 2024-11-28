const fs = require('fs');
const path = require('path');

const directoryPath = './'; // Replace with the path to your folder

const item = {
    "format_version": "1.20.41",
    "minecraft:item": {
        "description": {
            "identifier": "chestui:apple"
        },
        "components": {
            "minecraft:allow_off_hand": true,
            "minecraft:can_destroy_in_creative": false,
            "minecraft:display_name": {
                "value": "§l§1Apple"
            },
            "minecraft:icon": "chestui_icon_apple"
        }
    }
}

const textureData = require("../../item_texture.json");
let mcfunction = "";

// Array to store the names of .png files
let pngFiles = [];

// Read the directory
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    // Filter and collect .png file names
    pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');

    // Print the array of .png file names
    console.log(pngFiles);
    pngFiles.forEach((file) => {
        file = file.split(".")[0];
        const name = convertToTitleCase(file);
        item['minecraft:item'].description.identifier = `chestui:${file}`;
        item['minecraft:item'].components['minecraft:display_name'].value = `${name}`;
        item['minecraft:item'].components['minecraft:icon'] = `chestui_icon_${file}`;
        mcfunction += `\ngive @p chestui:${file}`;
        textureData.texture_data[`chestui_icon_${file}`] = {
            "textures": "textures/items/icons/" + file
        }
        fs.writeFileSync(`../../../../chestUI-bp/items/chestUI_${file}.item.json`, JSON.stringify(item,null,4));
    })
    fs.writeFileSync(`../../../../chestUI-bp/functions/chestui_icons.mcfunction`, mcfunction);
    fs.writeFileSync(`../../item_texture.json`, JSON.stringify(textureData,null,4));
    console.log(textureData);
});



function convertToTitleCase(str) {
    // Split the string by underscores
    let words = str.split('_');

    // Capitalize the first letter of each word and join them with spaces
    let result = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return result;
}
