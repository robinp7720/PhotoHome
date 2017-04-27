<?php
$id = $_GET['photo'];
$tag = $_POST['tag'];

$mysqli = new mysqli("localhost", "root", "root", "Photos");
if ($stmt = $mysqli->prepare("INSERT INTO tags (photo_id, value) VALUES (?,?)")) {
    $stmt->bind_param('is', $id, $tag);
    $stmt->execute();
    $stmt->close();
}

header('location: single.php?photo='.$id);