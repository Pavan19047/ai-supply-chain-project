// Firebase Data Initialization Script
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   databaseURL: 'https://your-project-id.firebaseio.com'
// });

const db = admin.firestore();

async function initializeData() {
  try {
    console.log('🗄️ Initializing Firestore with sample data...');

    // Create demo user
    const userRef = db.collection('users').doc('demo-admin');
    await userRef.set({
      email: 'admin@supply.com',
      hashed_password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
      full_name: 'Admin User',
      role: 'admin',
      is_active: true,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Sample inventory data
    const inventoryData = [
      {
        name: 'Product A',
        category: 'Electronics',
        current_stock: 150,
        min_stock: 20,
        max_stock: 200,
        unit_price: 25.99,
        supplier_id: 'supplier_1',
        location: 'Warehouse A',
        sku: 'PROD-A-001'
      },
      {
        name: 'Product B',
        category: 'Clothing',
        current_stock: 75,
        min_stock: 10,
        max_stock: 100,
        unit_price: 15.50,
        supplier_id: 'supplier_2',
        location: 'Warehouse B',
        sku: 'PROD-B-002'
      },
      {
        name: 'Product C',
        category: 'Food',
        current_stock: 5,
        min_stock: 25,
        max_stock: 150,
        unit_price: 8.75,
        supplier_id: 'supplier_1',
        location: 'Warehouse C',
        sku: 'PROD-C-003'
      }
    ];

    for (let i = 0; i < inventoryData.length; i++) {
      const item = inventoryData[i];
      await db.collection('inventory').add({
        ...item,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Sample suppliers data
    const suppliersData = [
      {
        name: 'Supplier One',
        contact_email: 'contact@supplier1.com',
        phone: '+1-555-0101',
        address: '123 Business St, City, State',
        performance_score: 4.5,
        active: true
      },
      {
        name: 'Supplier Two',
        contact_email: 'info@supplier2.com',
        phone: '+1-555-0102',
        address: '456 Commerce Ave, City, State',
        performance_score: 4.2,
        active: true
      }
    ];

    for (let i = 0; i < suppliersData.length; i++) {
      const supplier = suppliersData[i];
      await db.collection('suppliers').doc(`supplier_${i + 1}`).set({
        ...supplier,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Sample sales data
    const salesData = [];
    const products = ['PROD-A-001', 'PROD-B-002', 'PROD-C-003'];
    
    for (let i = 0; i < 100; i++) {
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30));
      
      salesData.push({
        product_sku: products[Math.floor(Math.random() * products.length)],
        quantity: Math.floor(Math.random() * 10) + 1,
        amount: Math.floor(Math.random() * 500) + 50,
        sale_date: saleDate,
        customer_id: `customer_${Math.floor(Math.random() * 20) + 1}`,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    const batch = db.batch();
    salesData.forEach((sale, index) => {
      const ref = db.collection('sales').doc(`sale_${index}`);
      batch.set(ref, sale);
    });
    await batch.commit();

    console.log('✅ Sample data initialized successfully!');
    console.log('📊 Created:');
    console.log(`   - 1 admin user (admin@supply.com / admin123)`);
    console.log(`   - ${inventoryData.length} inventory items`);
    console.log(`   - ${suppliersData.length} suppliers`);
    console.log(`   - ${salesData.length} sales records`);

  } catch (error) {
    console.error('❌ Error initializing data:', error);
  }
}

// Run initialization
initializeData();

module.exports = { initializeData };