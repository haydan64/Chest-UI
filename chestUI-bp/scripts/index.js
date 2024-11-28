import { world, system } from '@minecraft/server';
import * as MM from "@minecraft/server";
import * as Icons from './icons';

system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (e.id === "chestui:openMenu") {
        if (!e.sourceEntity) return;
        /**
         * An example object representing items in a chest UI.
         * 
         * @typedef {Object} ChestUI
         * @property {string} title - The title of the chest UI.
         * @property {Object.<string, Item>} items - The items in the chest, keyed by their slot number.
         */

        /**
         * An item in the chest UI.
         * 
         * @typedef {Object} Item
         * @property {string} item - The item ID.
         * @property {string} name - The name of the item.
         * @property {number} amount - The amount of the item.
         * @property {string[]} lore - The lore (description) of the item.
         * @property {string} onSelect - The event identifier triggered when the item is selected.
         */

        /** 
         * @type {ChestUI} 
         */
        const menuData = JSON.parse(e.message || "{}");
        const chest = e.sourceEntity.dimension.spawnEntity("chestui:menu_chest", e.sourceEntity.getHeadLocation());
        chest.getComponent(MM.EntityComponentTypes.Tameable).tame(e.sourceEntity);
        chest.nameTag = menuData.title || "§1Menu";
        const container = chest.getComponent(MM.EntityComponentTypes.Inventory).container;

        if(menuData.items) {
            Object.entries(menuData.items).forEach(([slot, item]) => {
                const itemStack = new MM.ItemStack(item.item,item.amount || 1);
                if(item.lore) item.lore[0] = "§" + item.lore[0];
                //"§" - This is so the item can't be stolen from the menu.
                else item.lore = ["§"];
                itemStack.setLore([
                    ...(item.lore || []),
                ]);
                itemStack.nameTag = item.name;
                container.setItem(parseInt(slot), itemStack);
            })
        }
    }
});



system.runInterval(()=>{
    const players = world.getPlayers({
        "tags": ["nearChestUI"]
    });

    players.forEach((player)=>{
        let menuItem = cursor.item;
        const cursor = player.getComponent(MM.EntityComponentTypes.CursorInventory);
        if(cursor.item && cursor.item.getLore()?.at(0)?.startsWith("§")) {
            menuItem = cursor.item;
            cursor.clear();
        }
        else {
            const inventory = player.getComponent(MM.EntityComponentTypes.Inventory).container;
            for(let i = 0; i < 36; i++) {
                const item = inventory.getItem(i);
                if(item && item.getLore()?.at(0)?.startsWith("§")) {
                    menuItem = item;
                    inventory.setItem(i, new MM.ItemStack("minecraft:air", 1))
                    break;
                };
            }
        }
        if(!menuItem) {
            const equipment = player.getComponent(MM.EntityComponentTypes.Equippable);
            Object.values(MM.EquipmentSlot).forEach((equipmentSlot)=>{
                const item = equipment.getEquipment(equipmentSlot);
                if(item && item.getLore()?.at(0)?.startsWith("§")) {
                    menuItem = item;
                    equipment.setEquipment(equipmentSlot, new MM.ItemStack("minecraft:air", 1));
                    return;
                };
            })
        }
        if(!menuItem) return;
        world.sendMessage(menuItem.typeId);
    })
})