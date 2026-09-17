<?php
session_start();
require_once '../config/database.php'; // DB connect

if(!isset($_SESSION['admin'])){
    header("Location: login.php");
    exit();
}

$admin_name = $_SESSION['admin'];
$pdo = db(); // database.php wala function

// 1. Total Products count
$stmt = $pdo->query("SELECT COUNT(*) FROM products");
$total_products = $stmt->fetchColumn();

// 2. Total Inquiries count  
$stmt = $pdo->query("SELECT COUNT(*) FROM inquiries WHERE status = 'new'");
$new_inquiries = $stmt->fetchColumn();

// 3. Total Users count
$stmt = $pdo->query("SELECT COUNT(*) FROM users");
$total_users = $stmt->fetchColumn();


// 1. Security Check - Agar login nahi to login page pe bhej do
if(!isset($_SESSION['admin'])){
    header("Location: login.php");
    exit();
}

$admin_name = $_SESSION['admin'];
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard - INQUIRE STORE</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background: #f4f6f9; }
        
        /* Header */
        .navbar { background: #2c3e50; color: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; }
        .navbar h1 { font-size: 20px; }
        .navbar a { color: white; text-decoration: none; background: #e74c3c; padding: 8px 15px; border-radius: 5px; }
        .navbar a:hover { background: #c0392b; }

        /* Sidebar + Content */
        .container { display: flex; }
        .sidebar { width: 250px; background: white; height: 100vh; padding: 20px; box-shadow: 2px 0 5px rgba(0,0,0,0.1); }
        .sidebar h3 { margin-bottom: 15px; color: #2c3e50; }
        .sidebar a { display: block; padding: 10px; color: #333; text-decoration: none; border-radius: 5px; margin-bottom: 5px; }
        .sidebar a:hover { background: #3498db; color: white; }

        .main-content { flex: 1; padding: 30px; }
        .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .card h4 { color: #7f8c8d; font-size: 14px; }
        .card h2 { color: #2c3e50; font-size: 28px; margin-top: 10px; }
    </style>
</head>
<body>

    <div class="navbar">
        <h1>INQUIRE STORE - Admin Panel</h1>
        <div>
            Welcome, <b><?php echo $admin_name; ?></b> | 
            <a href="logout.php">Logout</a>
        </div>
    </div>

    <div class="container">
        <div class="sidebar">
            <h3>Menu</h3>
            <a href="index.php">📊 Dashboard</a>
            <a href="#">📦 Products</a>
            <a href="#">📩 Inquiries</a>
            <a href="#">👤 Users</a>
            <a href="../index.html" target="_blank">🌐 View Website</a>
        </div>

        <div class="main-content">
            <h2>Dashboard</h2>
            <br>
            <div class="cards">
                <div class="card">
                    <h4>Total Products</h4>
                    <h2>25</h2> 
                </div>
                <div class="card">
                    <h4>New Inquiries</h4>
                    <h2>12</h2>
                </div>
                <div class="card">
                    <h4>Total Users</h4>
                    <h2>103</h2>
                </div>
            </div>

            <br><br>
            <div class="card">
                <h3>Recent Activity</h3>
                <p>Yahan baad me DB se latest inquiries aur orders show karenge.</p>
            </div>
        </div>
    </div>

</body>
</html>