<?php
declare(strict_types=1);
namespace App\Domain\Orders;
use PDO;

final class OrderRepository
{
    public function __construct(private PDO $pdo) {}

    public function all(): array {
        $rows=$this->pdo->query('SELECT payload FROM orders ORDER BY created_at DESC')->fetchAll();
        return array_values(array_map(fn($r)=>json_decode($r['payload']??'{}',true)?:[],$rows));
    }

    public function upsert(array $order): array {
        $id=(string)($order['id']??'');
        if($id===''){ $id=bin2hex(random_bytes(8)); $order['id']=$id; }
        $stmt=$this->pdo->prepare('INSERT INTO orders(id,client_id,client,address,status,source,total,invoice_id,payload,updated_at) VALUES(:id,:client_id,:client,:address,:status,:source,:total,:invoice_id,:payload,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET client_id=excluded.client_id,client=excluded.client,address=excluded.address,status=excluded.status,source=excluded.source,total=excluded.total,invoice_id=excluded.invoice_id,payload=excluded.payload,updated_at=CURRENT_TIMESTAMP');
        $stmt->execute([
            ':id'=>$id,
            ':client_id'=>$order['clientId']??null,
            ':client'=>(string)($order['client']??''),
            ':address'=>(string)($order['address']??''),
            ':status'=>(string)($order['status']??'pending'),
            ':source'=>(string)($order['source']??'web'),
            ':total'=>(float)($order['total']??0),
            ':invoice_id'=>$order['invoiceId']??null,
            ':payload'=>json_encode($order, JSON_UNESCAPED_UNICODE)
        ]);

        $del=$this->pdo->prepare('DELETE FROM order_items WHERE order_id=:oid');
        $del->execute([':oid'=>$id]);
        $ins=$this->pdo->prepare('INSERT INTO order_items(order_id,product_id,name,qty,price,sale,payload) VALUES(:order_id,:product_id,:name,:qty,:price,:sale,:payload)');
        foreach(($order['items']??[]) as $item){
            $ins->execute([':order_id'=>$id,':product_id'=>$item['id']??null,':name'=>$item['name']??'',':qty'=>(float)($item['qty']??0),':price'=>(float)($item['price']??0),':sale'=>(float)($item['sale']??0),':payload'=>json_encode($item, JSON_UNESCAPED_UNICODE)]);
        }
        return $order;
    }

    public function replaceAll(array $orders): void { $this->pdo->beginTransaction(); $this->pdo->exec('DELETE FROM orders'); foreach($orders as $o){$this->upsert($o);} $this->pdo->commit(); }
    public function delete(string $id): void { $st=$this->pdo->prepare('DELETE FROM orders WHERE id=:id'); $st->execute([':id'=>$id]); }
}
