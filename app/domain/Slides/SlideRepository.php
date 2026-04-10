<?php
declare(strict_types=1);
namespace App\Domain\Slides;
use PDO;

final class SlideRepository
{
    public function __construct(private PDO $pdo) {}
    public function all(): array { $rows=$this->pdo->query('SELECT payload FROM slides ORDER BY sort_order ASC, created_at DESC')->fetchAll(); return array_values(array_map(fn($r)=>json_decode($r['payload']??'{}',true)?:[],$rows)); }
    public function upsert(array $slide): array {
        $id=(string)($slide['id']??''); if($id===''){ $id=bin2hex(random_bytes(8)); $slide['id']=$id; }
        $st=$this->pdo->prepare('INSERT INTO slides(id,title,subtitle,image,cta_text,cta_link,sort_order,active,payload,updated_at) VALUES(:id,:title,:subtitle,:image,:cta_text,:cta_link,:sort_order,:active,:payload,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET title=excluded.title,subtitle=excluded.subtitle,image=excluded.image,cta_text=excluded.cta_text,cta_link=excluded.cta_link,sort_order=excluded.sort_order,active=excluded.active,payload=excluded.payload,updated_at=CURRENT_TIMESTAMP');
        $st->execute([':id'=>$id,':title'=>(string)($slide['title']??''),':subtitle'=>(string)($slide['subtitle']??''),':image'=>(string)($slide['image']??($slide['img']??'')),':cta_text'=>(string)($slide['ctaText']??''),':cta_link'=>(string)($slide['ctaLink']??''),':sort_order'=>(int)($slide['sort_order']??0),':active'=>!empty($slide['active'])?1:0,':payload'=>json_encode($slide, JSON_UNESCAPED_UNICODE)]);
        return $slide;
    }
    public function replaceAll(array $slides): void { $this->pdo->beginTransaction(); $this->pdo->exec('DELETE FROM slides'); foreach($slides as $s){$this->upsert($s);} $this->pdo->commit(); }
    public function delete(string $id): void { $st=$this->pdo->prepare('DELETE FROM slides WHERE id=:id'); $st->execute([':id'=>$id]); }
}
