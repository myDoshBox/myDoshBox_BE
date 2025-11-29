import mongoose from "mongoose";
import ProductTransaction from "../modules/transactions/productsTransaction/productsTransaction.model";
import ShippingDetails from "../modules/transactions/productsTransaction/shippingDetails.model";

const MONGODB_URI =
  "mongodb+srv://mydoshbox:VZMiMdnU1UQUWWsH@mydoshboxapp.hrcj11f.mongodb.net/mydoshboxapp_db";

const linkShippingToTransactions = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log(
      "Starting migration: Linking shipping details to transactions..."
    );

    // Find all shipping details
    const allShippingDetails = await ShippingDetails.find({});

    let updatedCount = 0;
    let errorCount = 0;

    for (const shipping of allShippingDetails) {
      try {
        // Find transaction by transaction_id
        const transaction = await ProductTransaction.findOne({
          transaction_id: (shipping as any).transaction_id,
        });

        if (transaction && !transaction.shipping) {
          // Use findByIdAndUpdate to bypass validation if needed
          await ProductTransaction.findByIdAndUpdate(
            transaction._id,
            { shipping: shipping._id },
            { runValidators: false } // Skip validation for this update
          );

          updatedCount++;
          console.log(
            `✅ Linked transaction ${transaction.transaction_id} to shipping ${shipping._id}`
          );
        }
      } catch (error) {
        errorCount++;
      }
    }

    console.log(`\n📈 MIGRATION SUMMARY:`);
    console.log(`   Successfully updated: ${updatedCount} transactions`);
    console.log(`   Errors: ${errorCount}`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Run the migration
linkShippingToTransactions().catch(console.error);
