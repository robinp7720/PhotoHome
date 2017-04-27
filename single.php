<?php
$id = $_GET['photo'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Photo Gallery</title>
    <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700" rel="stylesheet">
    <link rel="stylesheet" href="assets/single.css">
</head>
<body>
<nav>
    <h1 class="brand"><a href="index.php">Photos</a></h1>
</nav>
<div class="container">
<div class="photo-container">
    <img src='getImage.php?photo=<?=$id?>&full'/>
</div>
    <div class="photo-description">
        <div class="wrapper">
        <h3>Image Info</h3>
        <?php

        $mysqli = new mysqli("localhost", "root", "root", "Photos");

        $stmt = $mysqli->stmt_init();
        if ($stmt->prepare("SELECT * FROM exif WHERE photo_id=? ")) {
            $stmt->bind_param('i',$id);
            $stmt->execute();
            $output = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            foreach ($output as $key => $row) {
                if ($row['entry']!=='error' && !empty($row['entry'])) {
                    $row['entry'] = htmlentities($row['entry']);
                    $row['value'] = htmlentities($row['value']);
                    echo "<a href=\"index.php?tags={$row['value']}\" class=\"tag\">{$row['entry']}: {$row['value']}</a>";
                }
            }
        }
        ?>
        </div>
        <h3>Image Tags</h3>
        <?php

        $mysqli = new mysqli("localhost", "root", "root", "Photos");

        $stmt = $mysqli->stmt_init();
        if ($stmt->prepare("SELECT * FROM tags WHERE photo_id=? ")) {
            $stmt->bind_param('i',$id);
            $stmt->execute();
            $output = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            foreach ($output as $key => $row) {
                echo "<a href=\"index.php?tags={$row['value']}\" class=\"tag\">{$row['value']}</a>";
            }
        }
        ?>
        <br>
        <form action="addtag.php?photo=<?=$id?>" method="post">
            <input type="text" name="tag">
            <button type="submit">Add</button>
        </form>
        <h3>Image Classification</h3>
        <div class="wrapper">
            <h3>Image location</h3>
            <?php

            $mysqli = new mysqli("localhost", "root", "root", "Photos");

            $stmt = $mysqli->stmt_init();
            if ($stmt->prepare("SELECT * FROM location WHERE photo_id=? ")) {
                $stmt->bind_param('i',$id);
                $stmt->execute();
                $output = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                $stmt->close();
                $location = $output[0]['name'].', '.$output[0]['adminName'].', '.$output[0]['countryName'];
                if (!empty($output[0]['name']))
                    echo "<a href=\"index.php?tags={$location}\" class=\"tag\">{$location}</a>";
            }
            ?>
        </div>
    </div>
</div>
</body>
</html>
