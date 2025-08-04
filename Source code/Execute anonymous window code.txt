System.schedule('Daily Inventory Sync', '0 0 0 * * ?', new InventoryBatchJob());
