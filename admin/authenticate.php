<?php
session_start();
include('../config/db.php'); // apna db connection file ka path check kar lena

if(isset($_POST['username']) && isset($_POST['password'])){
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = $_POST['password'];

    $sql = "SELECT * FROM admins WHERE username='$username' LIMIT 1";
    $result = mysqli_query($conn, $sql);

    if(mysqli_num_rows($result) == 1){
        $row = mysqli_fetch_assoc($result);
        
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
} else {
    header("Location: login.php");
}
?>