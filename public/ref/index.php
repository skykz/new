<?php

if(isset($_GET['c'])) {
    setcookie('ref_code', $_GET['c'], time() + 86400, '/');
    header('Location: /');
} else header('Location: /');