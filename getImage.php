<?php
$config = require "config.php";

ini_set('memory_limit', '64M');
header('Content-Type: image/jpeg');

$id = $_GET['photo'];

if (isset($_GET['full'])) {
    $mysqli = new mysqli("localhost", "root", "root", "Photos");
    if ($stmt = $mysqli->prepare("SELECT path FROM photos WHERE id = ? LIMIT 1")) {
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $stmt->bind_result($path);
        $stmt->fetch();
        echo(file_get_contents($path));
        $stmt->close();
    }
} else {
    echo(file_get_contents($config['thumbnails']['path'] . $id . '.jpg'));
}
