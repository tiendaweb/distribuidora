<?php
declare(strict_types=1);
namespace App\Domain\Invoices;
use PDO;

final class InvoiceRepository
{
    public function __construct(private PDO $pdo) {}
    public function all(): array { $rows=$this->pdo->query('SELECT payload FROM invoices ORDER BY created_at DESC')->fetchAll(); return array_values(array_map(fn($r)=>json_decode($r['payload']??'{}',true)?:[],$rows)); }
    public function upsert(array $invoice): array {
        $id=(string)($invoice['id']??''); if($id===''){ $id=bin2hex(random_bytes(8)); $invoice['id']=$id; }
        $st=$this->pdo->prepare('INSERT INTO invoices(id,order_id,client_id,client,doc_type,total,payload,updated_at) VALUES(:id,:order_id,:client_id,:client,:doc_type,:total,:payload,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET order_id=excluded.order_id,client_id=excluded.client_id,client=excluded.client,doc_type=excluded.doc_type,total=excluded.total,payload=excluded.payload,updated_at=CURRENT_TIMESTAMP');
        $st->execute([':id'=>$id,':order_id'=>$invoice['orderId']??null,':client_id'=>$invoice['clientId']??null,':client'=>(string)($invoice['client']??''),':doc_type'=>(string)($invoice['docType']??'blanco'),':total'=>(float)($invoice['total']??0),':payload'=>json_encode($invoice, JSON_UNESCAPED_UNICODE)]);
        return $invoice;
    }
    public function replaceAll(array $invoices): void { $this->pdo->beginTransaction(); $this->pdo->exec('DELETE FROM invoices'); foreach($invoices as $i){$this->upsert($i);} $this->pdo->commit(); }
    public function delete(string $id): void { $st=$this->pdo->prepare('DELETE FROM invoices WHERE id=:id'); $st->execute([':id'=>$id]); }
}
