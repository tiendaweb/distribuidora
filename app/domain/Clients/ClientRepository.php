<?php
declare(strict_types=1);
namespace App\Domain\Clients;
use PDO;

final class ClientRepository
{
    public function __construct(private PDO $pdo) {}
    public function all(): array { $rows=$this->pdo->query('SELECT payload FROM clients ORDER BY created_at DESC')->fetchAll(); return array_values(array_map(fn($r)=>json_decode($r['payload']??'{}',true)?:[],$rows)); }
    public function upsert(array $client): array {
        $id=(string)($client['id']??''); if($id===''){ $id=bin2hex(random_bytes(8)); $client['id']=$id; }
        $stmt=$this->pdo->prepare('INSERT INTO clients(id,name,address,phone,email,cuit,tax,notes,payload,updated_at) VALUES(:id,:name,:address,:phone,:email,:cuit,:tax,:notes,:payload,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET name=excluded.name,address=excluded.address,phone=excluded.phone,email=excluded.email,cuit=excluded.cuit,tax=excluded.tax,notes=excluded.notes,payload=excluded.payload,updated_at=CURRENT_TIMESTAMP');
        $stmt->execute([':id'=>$id,':name'=>(string)($client['name']??''),':address'=>(string)($client['address']??''),':phone'=>(string)($client['phone']??''),':email'=>(string)($client['email']??''),':cuit'=>(string)($client['cuit']??''),':tax'=>(string)($client['tax']??'Consumidor Final'),':notes'=>(string)($client['notes']??''),':payload'=>json_encode($client, JSON_UNESCAPED_UNICODE)]);
        return $client;
    }
    public function replaceAll(array $clients): void { $this->pdo->beginTransaction(); $this->pdo->exec('DELETE FROM clients'); foreach($clients as $client){$this->upsert($client);} $this->pdo->commit(); }
    public function delete(string $id): void { $st=$this->pdo->prepare('DELETE FROM clients WHERE id=:id'); $st->execute([':id'=>$id]); }
}
