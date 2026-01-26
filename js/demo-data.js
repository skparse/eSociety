/**
 * Demo Data Generator for eSociety
 * Creates comprehensive sample data for demonstration purposes
 *
 * Usage: Load this script in browser console after logging in as admin
 * Call: await loadDemoData()
 */

const DemoData = {
    // Society Settings - Gulmohar Style
    settings: {
        societyName: "Shree Sai Gulmohar Co-op Hsg. Soc. Ltd.",
        registrationNo: "NBOM/CIDCO/HSG(TC)/5627/JTR/Year 2014-2015",
        address: "Plot No. 146/147/148, Sector - 10, New Panvel, Navi Mumbai - 410 206",
        phone: "022-27468520",
        email: "gulmohar.society@gmail.com",
        billingDay: 1,
        dueDays: 15,
        lateFeePercent: 2,
        logo: ""
    },

    // Buildings - Multiple Wings
    buildings: [
        { id: "bld-1", name: "A-Wing", totalFloors: 10, address: "A Wing, Gulmohar Society", isActive: true },
        { id: "bld-2", name: "B-Wing", totalFloors: 10, address: "B Wing, Gulmohar Society", isActive: true },
        { id: "bld-3", name: "C-Wing", totalFloors: 8, address: "C Wing, Gulmohar Society", isActive: true },
        { id: "bld-4", name: "Shops", totalFloors: 2, address: "Commercial Block, Gulmohar Society", isActive: true }
    ],

    // Flat Types
    flatTypes: [
        { id: "ft-1", name: "1 BHK", defaultArea: 432, isActive: true },
        { id: "ft-2", name: "2 BHK", defaultArea: 650, isActive: true },
        { id: "ft-3", name: "3 BHK", defaultArea: 950, isActive: true },
        { id: "ft-4", name: "Shop", defaultArea: 200, isActive: true },
        { id: "ft-5", name: "Penthouse", defaultArea: 1500, isActive: true }
    ],

    // Charge Types - Gulmohar Receipt Style (12 charge types)
    chargeTypes: [
        { id: "ct-1", name: "Service Charges", calculationType: "per_sqft", defaultAmount: 3.00, isMonthly: true, isActive: true },
        { id: "ct-2", name: "Property Tax", calculationType: "per_sqft", defaultAmount: 0.50, isMonthly: true, isActive: true },
        { id: "ct-3", name: "Sinking Fund", calculationType: "per_sqft", defaultAmount: 0.50, isMonthly: true, isActive: true },
        { id: "ct-4", name: "Major Repairs Fund", calculationType: "per_sqft", defaultAmount: 1.00, isMonthly: true, isActive: true },
        { id: "ct-5", name: "Electricity Charges", calculationType: "fixed", defaultAmount: 230, isMonthly: true, isActive: true },
        { id: "ct-6", name: "Water Charges", calculationType: "fixed", defaultAmount: 480, isMonthly: true, isActive: true },
        { id: "ct-7", name: "Parking Charges", calculationType: "per_vehicle", defaultAmount: 100, isMonthly: true, isActive: true, vehicleType: "4wheeler" },
        { id: "ct-8", name: "Non Occupancy Charges", calculationType: "fixed", defaultAmount: 0, isMonthly: true, isActive: true },
        { id: "ct-9", name: "Education and Training Fund", calculationType: "fixed", defaultAmount: 100, isMonthly: true, isActive: true },
        { id: "ct-10", name: "Legal Charges", calculationType: "fixed", defaultAmount: 0, isMonthly: true, isActive: true },
        { id: "ct-11", name: "Other Charges", calculationType: "fixed", defaultAmount: 0, isMonthly: true, isActive: true },
        { id: "ct-12", name: "Insurance", calculationType: "per_sqft", defaultAmount: 0.15, isMonthly: true, isActive: true }
    ],

    // Sample Flats covering all scenarios
    flats: [
        // A-Wing Flats
        { id: "flat-a001", flatNo: "A-001", buildingId: "bld-1", flatTypeId: "ft-1", area: 432, ownerName: "Dr. Balwant Mane", ownerPhone: "9876543210", ownerEmail: "balwant.mane@gmail.com", twoWheelerCount: 1, fourWheelerCount: 0, isOccupied: true, isActive: true },
        { id: "flat-a002", flatNo: "A-002", buildingId: "bld-1", flatTypeId: "ft-1", area: 432, ownerName: "Mr. Harish Patil", ownerPhone: "9876543211", ownerEmail: "harish.patil@gmail.com", twoWheelerCount: 0, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-a101", flatNo: "A-101", buildingId: "bld-1", flatTypeId: "ft-2", area: 650, ownerName: "Mrs. Julie Varghese", ownerPhone: "9876543212", ownerEmail: "julie.v@gmail.com", twoWheelerCount: 1, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-a102", flatNo: "A-102", buildingId: "bld-1", flatTypeId: "ft-2", area: 650, ownerName: "Mr. Sapale", ownerPhone: "9876543213", ownerEmail: "sapale@yahoo.com", twoWheelerCount: 0, fourWheelerCount: 2, isOccupied: true, isActive: true },
        { id: "flat-a103", flatNo: "A-103", buildingId: "bld-1", flatTypeId: "ft-1", area: 432, ownerName: "Mr. Dinesh Bole", ownerPhone: "9876543214", ownerEmail: "dinesh.bole@gmail.com", twoWheelerCount: 2, fourWheelerCount: 0, isOccupied: true, isActive: true },
        { id: "flat-a201", flatNo: "A-201", buildingId: "bld-1", flatTypeId: "ft-3", area: 950, ownerName: "Mr. B. S. Patil", ownerPhone: "9876543215", ownerEmail: "bs.patil@gmail.com", twoWheelerCount: 0, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-a202", flatNo: "A-202", buildingId: "bld-1", flatTypeId: "ft-2", area: 650, ownerName: "Mr. R. K. Singh", ownerPhone: "9876543216", ownerEmail: "rk.singh@gmail.com", twoWheelerCount: 1, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-a203", flatNo: "A-203", buildingId: "bld-1", flatTypeId: "ft-2", area: 650, ownerName: "Mr. Satyajeet Ingle", ownerPhone: "9876543217", ownerEmail: "satyajeet@gmail.com", twoWheelerCount: 0, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-a301", flatNo: "A-301", buildingId: "bld-1", flatTypeId: "ft-3", area: 950, ownerName: "Mr. Suresh Jadhav", ownerPhone: "9876543218", ownerEmail: "suresh.j@gmail.com", twoWheelerCount: 2, fourWheelerCount: 2, isOccupied: true, isActive: true },
        { id: "flat-a302", flatNo: "A-302", buildingId: "bld-1", flatTypeId: "ft-2", area: 650, ownerName: "Mr. Akbar Sheikh", ownerPhone: "9876543219", ownerEmail: "akbar.s@gmail.com", twoWheelerCount: 0, fourWheelerCount: 0, isOccupied: true, isActive: true },

        // B-Wing Flats
        { id: "flat-b001", flatNo: "B-001", buildingId: "bld-2", flatTypeId: "ft-1", area: 432, ownerName: "Mr. Kiran Kapse", ownerPhone: "9876543220", ownerEmail: "kiran.kapse@gmail.com", twoWheelerCount: 1, fourWheelerCount: 0, isOccupied: true, isActive: true },
        { id: "flat-b002", flatNo: "B-002", buildingId: "bld-2", flatTypeId: "ft-1", area: 432, ownerName: "Manoj Chavan", ownerPhone: "9876543221", ownerEmail: "manoj.c@gmail.com", twoWheelerCount: 0, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-b101", flatNo: "B-101", buildingId: "bld-2", flatTypeId: "ft-2", area: 650, ownerName: "Mr. Tanvir Malik", ownerPhone: "9876543222", ownerEmail: "tanvir.m@gmail.com", twoWheelerCount: 1, fourWheelerCount: 0, isOccupied: true, isActive: true },
        { id: "flat-b102", flatNo: "B-102", buildingId: "bld-2", flatTypeId: "ft-2", area: 650, ownerName: "Mr. Sujata Kashinath Jadhav", ownerPhone: "9876543223", ownerEmail: "sujata.j@gmail.com", twoWheelerCount: 0, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-b103", flatNo: "B-103", buildingId: "bld-2", flatTypeId: "ft-1", area: 432, ownerName: "Mr. P. Haridas", ownerPhone: "9876543224", ownerEmail: "p.haridas@gmail.com", twoWheelerCount: 2, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-b201", flatNo: "B-201", buildingId: "bld-2", flatTypeId: "ft-3", area: 950, ownerName: "Mr. Chandran Nair", ownerPhone: "9876543225", ownerEmail: "chandran.n@gmail.com", twoWheelerCount: 0, fourWheelerCount: 2, isOccupied: true, isActive: true },
        { id: "flat-b202", flatNo: "B-202", buildingId: "bld-2", flatTypeId: "ft-2", area: 650, ownerName: "Mr. Satish Parse", ownerPhone: "9876543226", ownerEmail: "satish.parse@gmail.com", twoWheelerCount: 1, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-b203", flatNo: "B-203", buildingId: "bld-2", flatTypeId: "ft-2", area: 650, ownerName: "Mr. N. C. Singh", ownerPhone: "9876543227", ownerEmail: "nc.singh@gmail.com", twoWheelerCount: 0, fourWheelerCount: 0, isOccupied: false, isActive: true }, // Vacant flat
        { id: "flat-b301", flatNo: "B-301", buildingId: "bld-2", flatTypeId: "ft-5", area: 1500, ownerName: "Mr. Atul Khare", ownerPhone: "9876543228", ownerEmail: "atul.khare@gmail.com", twoWheelerCount: 1, fourWheelerCount: 2, isOccupied: true, isActive: true },

        // C-Wing Flats
        { id: "flat-c101", flatNo: "C-101", buildingId: "bld-3", flatTypeId: "ft-2", area: 650, ownerName: "Mrs. Priya Sharma", ownerPhone: "9876543229", ownerEmail: "priya.s@gmail.com", twoWheelerCount: 1, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-c102", flatNo: "C-102", buildingId: "bld-3", flatTypeId: "ft-2", area: 650, ownerName: "Mr. Rajesh Kumar", ownerPhone: "9876543230", ownerEmail: "rajesh.k@gmail.com", twoWheelerCount: 0, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "flat-c201", flatNo: "C-201", buildingId: "bld-3", flatTypeId: "ft-3", area: 950, ownerName: "Dr. Anita Desai", ownerPhone: "9876543231", ownerEmail: "anita.d@gmail.com", twoWheelerCount: 0, fourWheelerCount: 2, isOccupied: true, isActive: true },
        { id: "flat-c202", flatNo: "C-202", buildingId: "bld-3", flatTypeId: "ft-1", area: 432, ownerName: "Mr. Vikas Rao", ownerPhone: "9876543232", ownerEmail: "vikas.rao@gmail.com", twoWheelerCount: 2, fourWheelerCount: 0, isOccupied: true, isActive: true },

        // Shops
        { id: "shop-001", flatNo: "Shop-01", buildingId: "bld-4", flatTypeId: "ft-4", area: 200, ownerName: "M/s Sharma Traders", ownerPhone: "9876543233", ownerEmail: "sharma.traders@gmail.com", twoWheelerCount: 0, fourWheelerCount: 0, isOccupied: true, isActive: true },
        { id: "shop-002", flatNo: "Shop-02", buildingId: "bld-4", flatTypeId: "ft-4", area: 250, ownerName: "M/s Fresh Mart", ownerPhone: "9876543234", ownerEmail: "freshmart@gmail.com", twoWheelerCount: 0, fourWheelerCount: 1, isOccupied: true, isActive: true },
        { id: "shop-003", flatNo: "Shop-03", buildingId: "bld-4", flatTypeId: "ft-4", area: 180, ownerName: "M/s Quick Services", ownerPhone: "9876543235", ownerEmail: "quickservices@gmail.com", twoWheelerCount: 0, fourWheelerCount: 0, isOccupied: false, isActive: true } // Vacant shop
    ],

    // Generate Users (passwords will be hashed during load)
    generateUsers: async function() {
        // Hash the default password "admin123"
        const hashedPassword = await Utils.hashPassword('admin123');

        const users = [
            // Admin user
            {
                id: "user-admin",
                username: "admin",
                password: hashedPassword,
                role: "admin",
                flatId: null,
                name: "Administrator",
                email: "admin@gulmohar.com",
                phone: "9876500000",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        // Create member users for some flats
        const memberFlats = ["flat-a101", "flat-a202", "flat-b101", "flat-b202", "flat-c101", "flat-c201"];
        for (const flatId of memberFlats) {
            const flat = this.flats.find(f => f.id === flatId);
            if (flat) {
                users.push({
                    id: `user-member-${users.length}`,
                    username: flat.flatNo.toLowerCase().replace("-", ""),
                    password: hashedPassword, // Same password for demo
                    role: "member",
                    flatId: flat.id,
                    name: flat.ownerName,
                    email: flat.ownerEmail,
                    phone: flat.ownerPhone,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
        }

        return users;
    },

    // Generate Bills for different months and scenarios
    generateBills: function() {
        const bills = [];
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // Generate bills for last 6 months for all flats
        const monthsToGenerate = [
            { month: currentMonth - 5 <= 0 ? currentMonth + 7 : currentMonth - 5, year: currentMonth - 5 <= 0 ? currentYear - 1 : currentYear },
            { month: currentMonth - 4 <= 0 ? currentMonth + 8 : currentMonth - 4, year: currentMonth - 4 <= 0 ? currentYear - 1 : currentYear },
            { month: currentMonth - 3 <= 0 ? currentMonth + 9 : currentMonth - 3, year: currentMonth - 3 <= 0 ? currentYear - 1 : currentYear },
            { month: currentMonth - 2 <= 0 ? currentMonth + 10 : currentMonth - 2, year: currentMonth - 2 <= 0 ? currentYear - 1 : currentYear },
            { month: currentMonth - 1 <= 0 ? 12 : currentMonth - 1, year: currentMonth - 1 <= 0 ? currentYear - 1 : currentYear },
            { month: currentMonth, year: currentYear }
        ];

        let billCounter = 0;

        monthsToGenerate.forEach(({ month, year }, monthIndex) => {
            this.flats.forEach((flat, flatIndex) => {
                billCounter++;
                const billNo = `BILL-${year}-${String(month).padStart(2, '0')}-${String(billCounter).padStart(4, '0')}`;

                // Calculate line items based on charge types
                const lineItems = [];
                let totalAmount = 0;

                this.chargeTypes.forEach(charge => {
                    let amount = 0;
                    let description = charge.name;

                    if (charge.calculationType === 'per_sqft') {
                        amount = flat.area * charge.defaultAmount;
                    } else if (charge.calculationType === 'per_vehicle') {
                        const vehicleCount = charge.vehicleType === '4wheeler' ? flat.fourWheelerCount : flat.twoWheelerCount;
                        amount = vehicleCount * charge.defaultAmount;
                        if (vehicleCount > 0) {
                            description = `${charge.name} (${vehicleCount} vehicle${vehicleCount > 1 ? 's' : ''})`;
                        }
                    } else {
                        amount = charge.defaultAmount;
                    }

                    // Add Non Occupancy charges for vacant flats
                    if (charge.id === 'ct-8' && !flat.isOccupied) {
                        amount = 500; // Non-occupancy charge for vacant flats
                    }

                    if (amount > 0) {
                        lineItems.push({
                            chargeTypeId: charge.id,
                            description: description,
                            amount: amount
                        });
                        totalAmount += amount;
                    }
                });

                // Determine bill status based on scenarios
                let status = 'pending';
                let paidAmount = 0;
                let previousDue = 0;
                let interest = 0;
                let penalty = 0;

                // Different scenarios:
                // Old bills (months 1-3): Mostly paid
                // Recent bills (months 4-5): Mix of paid, partial, pending
                // Current month: Mostly pending

                if (monthIndex < 3) {
                    // Old bills - 80% paid, 15% partial, 5% pending
                    const rand = Math.random();
                    if (rand < 0.80) {
                        status = 'paid';
                        paidAmount = totalAmount;
                    } else if (rand < 0.95) {
                        status = 'partial';
                        paidAmount = Math.floor(totalAmount * 0.5);
                    } else {
                        status = 'pending';
                        // Add interest and penalty for old unpaid bills
                        interest = Math.round(totalAmount * 0.02 * (6 - monthIndex));
                        penalty = monthIndex < 2 ? 500 : 0;
                    }
                } else if (monthIndex < 5) {
                    // Recent bills - 50% paid, 30% partial, 20% pending
                    const rand = Math.random();
                    if (rand < 0.50) {
                        status = 'paid';
                        paidAmount = totalAmount;
                    } else if (rand < 0.80) {
                        status = 'partial';
                        paidAmount = Math.floor(totalAmount * (0.3 + Math.random() * 0.4));
                    } else {
                        status = 'pending';
                    }
                } else {
                    // Current month - 20% paid, 10% partial, 70% pending
                    const rand = Math.random();
                    if (rand < 0.20) {
                        status = 'paid';
                        paidAmount = totalAmount;
                    } else if (rand < 0.30) {
                        status = 'partial';
                        paidAmount = Math.floor(totalAmount * 0.5);
                    }
                }

                // Calculate previous due from older unpaid bills
                if (monthIndex > 0) {
                    const previousBills = bills.filter(b =>
                        b.flatId === flat.id &&
                        b.status !== 'paid'
                    );
                    previousDue = previousBills.reduce((sum, b) => sum + (b.grandTotal - (b.paidAmount || 0)), 0);
                }

                const grandTotal = totalAmount + previousDue + interest + penalty;
                const billDate = new Date(year, month - 1, 1);
                const dueDate = new Date(year, month - 1, 15);

                bills.push({
                    id: `bill-${flat.id}-${year}-${month}`,
                    billNo: billNo,
                    flatId: flat.id,
                    month: month,
                    year: year,
                    lineItems: lineItems,
                    totalAmount: totalAmount,
                    previousDue: previousDue,
                    interest: interest,
                    penalty: penalty,
                    grandTotal: grandTotal,
                    status: status,
                    paidAmount: paidAmount,
                    dueDate: dueDate.toISOString(),
                    generatedAt: billDate.toISOString()
                });
            });
        });

        return bills;
    },

    // Generate Expenses for demonstration
    generateExpenses: function() {
        const expenses = [];
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Sample expenses covering 6 months
        const expenseTemplates = [
            { category: 'maintenance', description: 'Lift maintenance service', paidTo: 'Schindler India Pvt Ltd', amountRange: [3000, 5000] },
            { category: 'maintenance', description: 'Plumbing repair - Common area', paidTo: 'Rajesh Plumbing Services', amountRange: [1500, 4000] },
            { category: 'repairs', description: 'Water tank repair', paidTo: 'Tank Repair Contractors', amountRange: [8000, 15000] },
            { category: 'repairs', description: 'Compound wall repair', paidTo: 'Gupta Construction', amountRange: [5000, 12000] },
            { category: 'utilities', description: 'Common area electricity bill', paidTo: 'MSEDCL', amountRange: [12000, 20000] },
            { category: 'utilities', description: 'Water supply tanker', paidTo: 'Mumbai Water Supply', amountRange: [3000, 6000] },
            { category: 'salary', description: 'Security guard salary', paidTo: 'Securitas India', amountRange: [25000, 35000] },
            { category: 'salary', description: 'Housekeeping staff salary', paidTo: 'Clean India Services', amountRange: [15000, 20000] },
            { category: 'security', description: 'CCTV maintenance', paidTo: 'SecureTech Solutions', amountRange: [2000, 4000] },
            { category: 'cleaning', description: 'Water tank cleaning', paidTo: 'AquaClean Services', amountRange: [3000, 5000] },
            { category: 'cleaning', description: 'Pest control treatment', paidTo: 'Pest Control India', amountRange: [2500, 4000] },
            { category: 'administration', description: 'Accounting software renewal', paidTo: 'TallyPrime', amountRange: [8000, 12000] },
            { category: 'administration', description: 'Stationery and printing', paidTo: 'Office Mart', amountRange: [1000, 2000] },
            { category: 'insurance', description: 'Society insurance premium', paidTo: 'LIC of India', amountRange: [15000, 25000] },
            { category: 'legal', description: 'Legal consultation fee', paidTo: 'Advocate S.K. Sharma', amountRange: [5000, 10000] },
            { category: 'miscellaneous', description: 'Garden maintenance', paidTo: 'Green Gardens', amountRange: [2000, 4000] },
            { category: 'miscellaneous', description: 'Festival decoration', paidTo: 'Deco World', amountRange: [5000, 10000] }
        ];

        const paymentModes = ['cash', 'cheque', 'upi', 'bank_transfer'];
        let receiptCounter = 1;

        // Generate expenses for last 6 months
        for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
            const expenseMonth = new Date(currentYear, currentMonth - monthOffset, 1);

            // Each month has 3-6 random expenses
            const numExpenses = 3 + Math.floor(Math.random() * 4);

            for (let i = 0; i < numExpenses; i++) {
                const template = expenseTemplates[Math.floor(Math.random() * expenseTemplates.length)];
                const amount = Math.floor(template.amountRange[0] + Math.random() * (template.amountRange[1] - template.amountRange[0]));

                // Random date within the month
                const day = Math.floor(Math.random() * 28) + 1;
                const expenseDate = new Date(expenseMonth.getFullYear(), expenseMonth.getMonth(), day);

                expenses.push({
                    id: `exp-${Date.now()}-${receiptCounter}`,
                    date: expenseDate.toISOString(),
                    category: template.category,
                    description: template.description,
                    amount: amount,
                    paidTo: template.paidTo,
                    receiptNumber: `EXP-${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}-${String(receiptCounter).padStart(3, '0')}`,
                    paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
                    notes: '',
                    createdAt: expenseDate.toISOString(),
                    createdBy: 'user-admin',
                    updatedAt: expenseDate.toISOString(),
                    updatedBy: 'user-admin'
                });

                receiptCounter++;
            }
        }

        // Sort by date
        expenses.sort((a, b) => new Date(a.date) - new Date(b.date));

        return expenses;
    },

    // Generate Payments based on bills
    generatePayments: function(bills) {
        const payments = [];
        let paymentCounter = 0;

        const paymentModes = ['cash', 'cheque', 'upi', 'bank_transfer'];

        bills.forEach(bill => {
            if (bill.paidAmount > 0) {
                paymentCounter++;
                const paymentDate = new Date(bill.generatedAt);
                paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 20) + 1);

                // For partially paid bills, might have multiple payments
                let remainingAmount = bill.paidAmount;

                while (remainingAmount > 0) {
                    const paymentAmount = bill.status === 'partial' && remainingAmount > 1000
                        ? Math.floor(remainingAmount * (0.4 + Math.random() * 0.3))
                        : remainingAmount;

                    payments.push({
                        id: `pay-${bill.id}-${paymentCounter}`,
                        receiptNo: `RCP-${bill.year}-${String(bill.month).padStart(2, '0')}-${String(paymentCounter).padStart(4, '0')}`,
                        flatId: bill.flatId,
                        billId: bill.id,
                        amount: paymentAmount,
                        paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
                        referenceNo: `REF${Date.now()}${Math.floor(Math.random() * 1000)}`,
                        paymentDate: paymentDate.toISOString(),
                        receivedBy: "user-admin",
                        remarks: "",
                        createdAt: paymentDate.toISOString()
                    });

                    remainingAmount -= paymentAmount;
                    paymentCounter++;

                    // Add a few days for next payment
                    if (remainingAmount > 0) {
                        paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 7) + 1);
                    }
                }
            }
        });

        return payments;
    }
};

// Main function to load demo data
async function loadDemoData() {
    // SAFETY CHECK: Only allow demo data loading for DEMO society
    const currentSociety = getCurrentSocietyId();
    if (currentSociety && currentSociety !== 'DEMO') {
        alert('ERROR: Demo data can only be loaded for the DEMO society.\n\nYou are currently logged into: ' + currentSociety + '\n\nTo use demo mode, please go to demo.html');
        console.error('Demo data loading blocked - not a DEMO society:', currentSociety);
        return;
    }

    if (!confirm('This will replace all existing data with demo data. Continue?')) {
        console.log('Demo data loading cancelled.');
        return;
    }

    console.log('Loading demo data...');

    try {
        Utils.showLoading('Setting up demo data...');

        // Generate all data (users is async now)
        const users = await DemoData.generateUsers();
        const bills = DemoData.generateBills();
        const payments = DemoData.generatePayments(bills);
        const expenses = DemoData.generateExpenses();

        const masterData = {
            buildings: DemoData.buildings,
            flatTypes: DemoData.flatTypes,
            chargeTypes: DemoData.chargeTypes
        };

        // Save all data
        Utils.showLoading('Saving settings...');
        await storage.saveSettings(DemoData.settings);

        Utils.showLoading('Saving master data...');
        await storage.saveMasterData(masterData);

        Utils.showLoading('Saving users...');
        await storage.saveUsers(users);

        Utils.showLoading('Saving flats...');
        await storage.saveFlats(DemoData.flats);

        Utils.showLoading('Saving bills...');
        await storage.saveBills(bills);

        Utils.showLoading('Saving payments...');
        await storage.savePayments(payments);

        Utils.showLoading('Saving expenses...');
        await storage.saveExpenses(expenses);

        Utils.hideLoading();

        // Show summary
        console.log('='.repeat(50));
        console.log('DEMO DATA LOADED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log(`Society: ${DemoData.settings.societyName}`);
        console.log(`Buildings: ${DemoData.buildings.length}`);
        console.log(`Flat Types: ${DemoData.flatTypes.length}`);
        console.log(`Charge Types: ${DemoData.chargeTypes.length}`);
        console.log(`Flats: ${DemoData.flats.length}`);
        console.log(`Users: ${users.length}`);
        console.log(`Bills: ${bills.length}`);
        console.log(`Payments: ${payments.length}`);
        console.log(`Expenses: ${expenses.length}`);
        console.log('='.repeat(50));
        console.log('LOGIN CREDENTIALS:');
        console.log('Admin Login: admin / admin123');
        console.log('Member Logins: a101, a202, b101, b202, c101, c201 / admin123');
        console.log('='.repeat(50));

        Utils.showToast('Demo data loaded successfully! Please refresh the page.', 'success');

        // Offer to refresh
        if (confirm('Demo data loaded! Refresh page now?')) {
            window.location.reload();
        }

    } catch (error) {
        console.error('Error loading demo data:', error);
        Utils.hideLoading();
        Utils.showToast('Error loading demo data: ' + error.message, 'error');
    }
}

// Quick stats function
function showDemoStats() {
    const bills = DemoData.generateBills();
    const payments = DemoData.generatePayments(bills);

    const totalBilled = bills.reduce((sum, b) => sum + b.grandTotal, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = totalBilled - totalPaid;

    const paidBills = bills.filter(b => b.status === 'paid').length;
    const partialBills = bills.filter(b => b.status === 'partial').length;
    const pendingBills = bills.filter(b => b.status === 'pending').length;

    console.log('='.repeat(50));
    console.log('DEMO DATA STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total Flats: ${DemoData.flats.length}`);
    console.log(`  - Occupied: ${DemoData.flats.filter(f => f.isOccupied).length}`);
    console.log(`  - Vacant: ${DemoData.flats.filter(f => !f.isOccupied).length}`);
    console.log('');
    console.log(`Total Bills: ${bills.length}`);
    console.log(`  - Paid: ${paidBills} (${Math.round(paidBills/bills.length*100)}%)`);
    console.log(`  - Partial: ${partialBills} (${Math.round(partialBills/bills.length*100)}%)`);
    console.log(`  - Pending: ${pendingBills} (${Math.round(pendingBills/bills.length*100)}%)`);
    console.log('');
    console.log(`Total Payments: ${payments.length}`);
    console.log('');
    console.log(`Total Billed: ₹ ${totalBilled.toLocaleString('en-IN')}`);
    console.log(`Total Collected: ₹ ${totalPaid.toLocaleString('en-IN')}`);
    console.log(`Total Outstanding: ₹ ${totalOutstanding.toLocaleString('en-IN')}`);
    console.log(`Collection Rate: ${Math.round(totalPaid/totalBilled*100)}%`);
    console.log('='.repeat(50));
}

console.log('Demo Data module loaded. Available functions:');
console.log('  - loadDemoData() : Load all demo data (replaces existing data)');
console.log('  - showDemoStats() : Show statistics of demo data');
