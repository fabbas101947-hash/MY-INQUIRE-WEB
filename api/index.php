<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/bootstrap.php';
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($action === 'csrf') json(['csrf' => csrf()]);
    if ($action === 'products' && $method === 'GET') {
        $stmt = db()->query("SELECT id,name,description,price,image,category,size,color,stock,status FROM products WHERE status='active' ORDER BY id DESC");
        json(['products' => $stmt->fetchAll()]);
    }
    if ($action === 'contact' && $method === 'POST') {
        $d = body(); if (!valid_csrf($d)) json(['error' => 'Invalid request. Refresh and try again.'], 419);
        $name=clean((string)($d['name']??'')); $email=filter_var($d['email']??'', FILTER_VALIDATE_EMAIL); $phone=clean((string)($d['phone']??'')); $subject=clean((string)($d['subject']??'')); $message=clean((string)($d['message']??''));
        if (mb_strlen($name)<2 || !$email || mb_strlen($subject)<2 || mb_strlen($message)<5) json(['error'=>'Please enter valid contact details.'],422);
        db()->prepare('INSERT INTO contact_messages(name,email,phone,subject,message) VALUES(?,?,?,?,?)')->execute([$name,$email,$phone,$subject,$message]);
        json(['message'=>'Message sent successfully.']);
    }
    if ($action === 'checkout' && $method === 'POST') {
        $d=body(); if (!valid_csrf($d)) json(['error'=>'Invalid request. Refresh and try again.'],419);
        $customer=$d['customer']??[]; $items=$d['items']??[];
        $name=clean((string)($customer['fullName']??'')); $email=filter_var($customer['email']??'',FILTER_VALIDATE_EMAIL); $phone=clean((string)($customer['phone']??''));
        $address=clean((string)($customer['address']??'')); $city=clean((string)($customer['city']??'')); $postal=clean((string)($customer['postalCode']??''));
        if (mb_strlen($name)<2 || !$email || mb_strlen($phone)<8 || mb_strlen($address)<5 || mb_strlen($city)<2 || !preg_match('/^\d{5}$/',$postal) || !$items) json(['error'=>'Please enter valid delivery details and cart items.'],422);
        $pdo=db(); $pdo->beginTransaction();
        try {
            $total=0; $validated=[]; $productStmt=$pdo->prepare("SELECT id,name,price,stock,status FROM products WHERE id=? FOR UPDATE");
            foreach ($items as $item) { $id=(int)($item['product_id']??0); $qty=(int)($item['quantity']??0); if(!$id||$qty<1) throw new RuntimeException('Invalid cart item.'); $productStmt->execute([$id]); $p=$productStmt->fetch(); if(!$p||$p['status']!=='active') throw new RuntimeException('A product is unavailable.'); if($qty>(int)$p['stock']) throw new RuntimeException($p['name'].' does not have enough stock.'); $size=clean((string)($item['size']??'')); $color=clean((string)($item['color']??'')); $subtotal=(float)$p['price']*$qty; $total+=$subtotal; $validated[]=[$p,$qty,$size,$color,$subtotal]; }
            $orderNo='ORD-'.date('Ymd').'-'.strtoupper(bin2hex(random_bytes(3)));
            $shippingAddress="$address, $city, ".clean((string)($customer['province']??'')).", $postal, Pakistan";
            $pdo->prepare("INSERT INTO orders(order_number,customer_name,customer_email,customer_phone,shipping_address,total_amount,order_status) VALUES(?,?,?,?,?,?, 'Pending')")->execute([$orderNo,$name,$email,$phone,$shippingAddress,$total]); $orderId=(int)$pdo->lastInsertId();
            $itemStmt=$pdo->prepare('INSERT INTO order_items(order_id,product_id,product_name,size,color,quantity,price,subtotal) VALUES(?,?,?,?,?,?,?,?)'); $stockStmt=$pdo->prepare('UPDATE products SET stock=stock-? WHERE id=?');
            foreach($validated as [$p,$qty,$size,$color,$subtotal]) { $itemStmt->execute([$orderId,$p['id'],$p['name'],$size,$color,$qty,$p['price'],$subtotal]); $stockStmt->execute([$qty,$p['id']]); }
            $pdo->commit(); json(['message'=>'Order placed successfully!','order_number'=>$orderNo]);
        } catch(Throwable $e) { if($pdo->inTransaction()) $pdo->rollBack(); throw $e; }
    }
    json(['error'=>'Not found.'],404);
} catch (RuntimeException $e) { json(['error'=>$e->getMessage()],422); }
catch (Throwable $e) { error_log($e->getMessage()); json(['error'=>'Unable to process your request. Please try again.'],500); }
