<?php
session_start();

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $username = $_POST["username"];
    $password = $_POST["password"];

    // Temporary admin login
    if ($username === "admin" && $password === "12345") {

        $_SESSION["admin"] = $username;

        header("Location: index.php");
        exit();

    } else {
        $error = "Invalid username or password!";
    }
}
?>

