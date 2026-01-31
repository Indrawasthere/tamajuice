import ThermalPrinter from "node-thermal-printer";

const printerTypes = ThermalPrinter.Types;

export async function printReceipt(order) {
  try {
    // Check if printer is configured
    if (!process.env.PRINTER_TYPE) {
      console.log("Printer not configured, skipping print...");
      console.log("Receipt data:", JSON.stringify(order, null, 2));
      return;
    }

    const printer = new ThermalPrinter.printer({
      type: printerTypes.EPSON,
      interface: process.env.PRINTER_INTERFACE || "/dev/usb/lp0",
      characterSet: "INDONESIA",
      removeSpecialCharacters: false,
      lineCharacter: "=",
      options: {
        timeout: 5000,
      },
    });

    const isPrinterConnected = await printer.isPrinterConnected();

    if (!isPrinterConnected) {
      console.error("Printer not connected");
      return;
    }

    // Header
    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.bold(true);
    printer.println("JUS BUAH TAMA");
    printer.bold(false);
    printer.println("Fresh juice everyday");
    printer.println("WA: 0823-1233-5006");
    printer.drawLine();

    // Order info
    printer.alignLeft();
    printer.println(`No: ${order.orderNumber}`);
    printer.println(`Kasir: ${order.user.name}`);
    printer.println(
      `Tanggal: ${new Date(order.createdAt).toLocaleString("id-ID")}`,
    );
    printer.drawLine();

    // Order items
    printer.tableCustom([
      { text: "Item", align: "LEFT", width: 0.5 },
      { text: "Qty", align: "CENTER", width: 0.15 },
      { text: "Harga", align: "RIGHT", width: 0.35 },
    ]);
    printer.drawLine();

    for (const item of order.orderItems) {
      printer.tableCustom([
        { text: item.product.name, align: "LEFT", width: 0.5 },
        { text: item.quantity.toString(), align: "CENTER", width: 0.15 },
        {
          text: formatRupiah(item.price * item.quantity),
          align: "RIGHT",
          width: 0.35,
        },
      ]);

      if (item.notes) {
        printer.println(`  Note: ${item.notes}`);
      }
    }

    printer.drawLine();

    // Totals
    printer.tableCustom([
      { text: "Subtotal", align: "LEFT", width: 0.65 },
      { text: formatRupiah(order.subtotal), align: "RIGHT", width: 0.35 },
    ]);

    if (order.discount > 0) {
      printer.tableCustom([
        { text: "Diskon", align: "LEFT", width: 0.65 },
        { text: formatRupiah(order.discount), align: "RIGHT", width: 0.35 },
      ]);
    }

    printer.bold(true);
    printer.tableCustom([
      { text: "TOTAL", align: "LEFT", width: 0.65 },
      { text: formatRupiah(order.total), align: "RIGHT", width: 0.35 },
    ]);
    printer.bold(false);

    printer.drawLine();

    // Payment info
    printer.tableCustom([
      { text: `${order.paymentMethod}`, align: "LEFT", width: 0.65 },
      { text: formatRupiah(order.amountPaid), align: "RIGHT", width: 0.35 },
    ]);

    if (order.change > 0) {
      printer.tableCustom([
        { text: "Kembalian", align: "LEFT", width: 0.65 },
        { text: formatRupiah(order.change), align: "RIGHT", width: 0.35 },
      ]);
    }

    printer.drawLine();

    // Footer
    printer.alignCenter();
    printer.newLine();
    printer.println("Terima kasih!");
    printer.println("Sehat selalu! 🍹");
    printer.newLine();
    printer.newLine();
    printer.newLine();

    // Cut paper
    printer.cut();

    await printer.execute();
    console.log("Receipt printed successfully!");
  } catch (error) {
    console.error("Print receipt error:", error);
    throw error;
  }
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
