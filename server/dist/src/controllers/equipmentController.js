import * as equipmentService from "../services/equipmentService.js";
export async function getEquipment(req, res) {
    try {
        const equipment = await equipmentService.getEquipment(req.query);
        res.json(equipment);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch equipment" });
    }
}
// Create equipment (POST)
export async function createEquipment(req, res) {
    try {
        console.log("Received createEquipment request:", req.body);
        const result = await equipmentService.createEquipment(req.body);
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        console.error("Error creating equipment:", error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
// Get a jobsite by QR code (for QR code uniqueness check)
export async function getEquipmentByQrId(req, res) {
    try {
        const { qrId } = req.params;
        if (!qrId) {
            return res.status(400).json({ error: "Invalid QR code" });
        }
        const equipment = await equipmentService.getEquipmentByQrId(qrId);
        if (!equipment) {
            return res.status(200).json({
                available: true,
                message: "QR code is available and not in use.",
            });
        }
        res.json({ available: false, equipment });
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}
//# sourceMappingURL=equipmentController.js.map