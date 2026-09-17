<?php
session_start();
require_once '../config/database.php'; // PDO wala file

if(isset($_POST['username']) && isset($_POST['password'])){
    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        $pdo = db(); // function name db() hai apke file me
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = :username LIMIT 1");
        $stmt->execute(['username' => $username]);
        $row = $stmt->fetch();

        if($row){
            // Check hashed password
            if(password_verify($password, $row['password'])){
                $_SESSION['admin'] = $row['username'];
                header("Location: index.php");
                exit();
            } else {
                echo "Invalid username or password. <a href='login.php'>Try again</a>";
            }
        } else {
            echo "Invalid username or password. <a href='login.php'>Try again</a>";
        }
    } catch(PDOException $e){
        echo "DB Error: " . $e->getMessage();
    }

} else {
    header("Location: login.php");
}
?>