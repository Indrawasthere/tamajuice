import ThermalPrinter from "node-thermal-printer";

const printerTypes = ThermalPrinter.Types;

export async function printOnlineReceipt(order) {
  try {
    if (!process.env.PRINTER_TYPE) {
      console.log("Printer not configured, skip printing");
      console.log(order);
      return;
    }

    const printer = new ThermalPrinter.printer({
      type: printerTypes.EPSON,
      interface: process.env.PRINTER_INTERFACE || "/dev/usb/lp0",
      characterSet: "INDONESIA",
      removeSpecialCharacters: false,
      lineCharacter: "=",
      options: { timeout: 5000 },
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      console.error("Printer not connected");
      return;
    }

    // ===== HEADER =====
    printer.alignCenter();
    printer.bold(true);
    printer.println("RIFAD COLLECTION");
    printer.bold(false);
    printer.println("Busana Muslimah");
    printer.println("WA: 0823-1233-5006");
    printer.drawLine();

    // ===== ORDER INFO =====
    printer.alignLeft();
    printer.println(`ORDER : ${order.orderNumber}`);
    printer.println(`P  : ${order.receiptName}`);
    printer.println(`HP    : ${order.phone}`);
    printer.println("--------------------------------");

    // ===== ADDRESS =====
    printer.bold(true);
    printer.println("ALAMAT:");
    printer.bold(false);
    printer.println(order.address);
    printer.drawLine();

    // ===== ITEMS =====
    printer.bold(true);
    printer.println("ISI PAKET:");
    printer.bold(false);

    for (const item of order.orderItems) {
      printer.println(`- ${item.product.name} x${item.quantity}`);
    }

    printer.drawLine();

    // ===== FOOTER =====
    printer.alignCenter();
    printer.newLine();
    printer.println("Terima kasih sudah belanja 💙");
    printer.newLine();
    printer.newLine();

    printer.cut();
    await printer.execute();

    console.log("Online receipt printed");
  } catch (err) {
    console.error("Print online receipt error:", err);
    throw err;
  }
}
