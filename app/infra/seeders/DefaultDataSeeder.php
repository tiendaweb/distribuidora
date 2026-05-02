<?php

declare(strict_types=1);

namespace App\Infra\Seeders;

use PDO;

final class DefaultDataSeeder
{
    private const DEFAULT_PRODUCTS = [
        ['id' => '69c30deeb7a1f', 'name' => 'Milanesas de Soja Rebozadas', 'short' => 'Ricas y crocantes milanesas de soja, ideales para horno o fritura.', 'desc' => 'Proteína vegetal con rebozado crocante. Opción vegetal, listas en minutos y aptas para horno o fritura.', 'price' => 10000, 'sale' => 8000, 'cat' => 'congelados', 'badge' => 'Ofertas', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c30dbbc3e7d.png', 'cost' => 5200, 'margin' => 53.8, 'stock' => 40],
        ['id' => '69c30eb05e223', 'name' => 'Ravioles Pollo y Espinaca x 1kg', 'short' => 'Ravioles El Sol. Calidad premium, relleno de pollo y espinaca.', 'desc' => 'Calidad premium. Relleno de pollo y espinaca. Listos en minutos. Presentación 1 kg.', 'price' => 30000, 'sale' => 2770, 'cat' => 'pastas', 'badge' => 'Ofertas', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c49625e4a09.png', 'cost' => 1800, 'margin' => 53.8, 'stock' => 35],
        ['id' => '69c3100355174', 'name' => 'Copa Caribe Dulce de Leche Sin Gluten', 'short' => 'Helado cremoso sabor dulce de leche, sin gluten.', 'desc' => 'Sabor dulce de leche intenso, textura cremosa y sin gluten.', 'price' => 3000, 'sale' => 2500, 'cat' => 'helados', 'badge' => 'Ofertas', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c30ff7a3584.png', 'cost' => 1550, 'margin' => 61.3, 'stock' => 80],
        ['id' => '69c49f59f19a6', 'name' => 'Ravioles Ricotta x 1kg', 'short' => 'Ravioles El Sol con relleno de ricotta. Sabor casero único.', 'desc' => 'Calidad premium con relleno de ricotta. Listos en minutos. Presentación 1 kg.', 'price' => 3000, 'sale' => 2770, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c496269320e.png', 'cost' => 1800, 'margin' => 53.8, 'stock' => 50],
        ['id' => '69c4a49fb1004', 'name' => 'Ravioles 4 Quesos x 1kg', 'short' => 'Ravioles El Sol con relleno de 4 quesos. Sabor intenso.', 'desc' => 'Calidad premium con relleno de 4 quesos. Listos en minutos. Presentación 1 kg.', 'price' => 3000, 'sale' => 2770, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c4962631b73.png', 'cost' => 1800, 'margin' => 53.8, 'stock' => 44],
        ['id' => '69c4a4fcc731a', 'name' => 'Ravioles Espinaca x 1kg', 'short' => 'Ravioles El Sol con relleno de espinaca. Receta casera.', 'desc' => 'Calidad premium con relleno de espinaca. Listos en minutos. Presentación 1 kg.', 'price' => 3000, 'sale' => 2770, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c496264e233.png', 'cost' => 1800, 'margin' => 53.8, 'stock' => 37],
        ['id' => '69c4a563b886e', 'name' => 'Ravioles Tomate y Muzarella x 1kg', 'short' => 'Ravioles El Sol con relleno de tomate y muzarella.', 'desc' => 'Calidad premium con relleno de tomate y muzarella. Listos en minutos. Presentación 1 kg.', 'price' => 3000, 'sale' => 2770, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c58f5744318.jpg', 'cost' => 1800, 'margin' => 53.8, 'stock' => 30],
        ['id' => '69c4a5ee73e5a', 'name' => 'Capelettis Jamón y Muzarella x 500gr', 'short' => 'Capelettis El Sol con jamón y muzarella. Relleno abundante.', 'desc' => 'Calidad premium con relleno de jamón y muzarella. Presentación 500 gr.', 'price' => 2100, 'sale' => 1875, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c4962702cc5.png', 'cost' => 1210, 'margin' => 55, 'stock' => 70],
        ['id' => '69c4a675d5b8e', 'name' => 'Sorrentinos Jamón y Muzarella x 400gr', 'short' => 'Sorrentinos El Sol con jamón y muzarella. Masa suave.', 'desc' => 'Calidad premium con relleno de jamón y muzarella. Presentación 400 gr.', 'price' => 2180, 'sale' => 1970, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c496271b346.png', 'cost' => 1295, 'margin' => 52.1, 'stock' => 52],
        ['id' => '69c4a73365474', 'name' => 'Ravioles Calabaza y Muzarella x 1kg', 'short' => 'Ravioles El Sol con calabaza y muzarella. Combo irresistible.', 'desc' => 'Calidad premium con relleno de calabaza y muzarella. Presentación 1 kg.', 'price' => 3000, 'sale' => 2770, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c49625be8f4.png', 'cost' => 1800, 'margin' => 53.8, 'stock' => 48],
        ['id' => '69c593ac02326', 'name' => 'Ravioles Pollo y Espinaca x 500gr', 'short' => 'Ravioles El Sol, presentación 500g. Relleno de pollo y espinaca.', 'desc' => 'Calidad premium con relleno de pollo y espinaca. Presentación 500 g.', 'price' => 2100, 'sale' => 1800, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c591ba518fd.jpg', 'cost' => 1150, 'margin' => 56.5, 'stock' => 54],
        ['id' => '69c5956bb0be7', 'name' => 'Ravioles 4 Quesos x 500gr', 'short' => 'Ravioles El Sol, presentación 500g. Relleno 4 quesos.', 'desc' => 'Calidad premium con relleno de 4 quesos. Presentación 500 g.', 'price' => 2100, 'sale' => 1800, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c591ba50a29.jpg', 'cost' => 1150, 'margin' => 56.5, 'stock' => 58],
        ['id' => '69c88aece4514', 'name' => 'Tallarines al Huevo x 500gr', 'short' => 'Tallarines al huevo. Ideales para compartir en familia.', 'desc' => 'Tallarines al huevo especiales para toda la familia. Presentación bandeja 500 g.', 'price' => 1950, 'sale' => 1738, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c88960d8ece.jpg', 'cost' => 1120, 'margin' => 55.2, 'stock' => 63],
        ['id' => '69c892aaea1a1', 'name' => 'Summun Tres Mix (caja x24u)', 'short' => 'Helado de agua sabor frutilla, manzana y ananá.', 'desc' => 'Tres sabores: frutilla, manzana y ananá. Helado de agua. Presentación caja x24.', 'price' => 14000, 'sale' => 12000, 'cat' => 'helados', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89043e9d55.png', 'cost' => 7800, 'margin' => 53.8, 'stock' => 18],
        ['id' => '69c89325d26db', 'name' => 'Summun Frutilla y Limón (caja x24u)', 'short' => 'Helado de agua sabor frutilla y limón. Caja x 24u.', 'desc' => 'Sabores frutilla y limón. Helado de agua. Presentación caja x24.', 'price' => 14000, 'sale' => 12000, 'cat' => 'helados', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89043e9f19.png', 'cost' => 7800, 'margin' => 53.8, 'stock' => 15],
        ['id' => '69c89420ee6af', 'name' => 'Summun Frutilla (caja x24u)', 'short' => 'Helado de agua sabor frutilla. Caja x 24u.', 'desc' => 'Sabor frutilla. Helado de agua. Presentación caja x24.', 'price' => 14000, 'sale' => 12000, 'cat' => 'helados', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89045023da.png', 'cost' => 7800, 'margin' => 53.8, 'stock' => 14],
        ['id' => '69c894b2cc6b8', 'name' => 'Summun Mix Naranja/Ananá (caja x24u)', 'short' => 'Helado de agua sabor naranja y ananá. Caja x 24u.', 'desc' => 'Sabores naranja y ananá. Helado de agua. Presentación caja x24.', 'price' => 14000, 'sale' => 12000, 'cat' => 'helados', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89045027ee.png', 'cost' => 7800, 'margin' => 53.8, 'stock' => 12],
        ['id' => '69c894f917b58', 'name' => 'Summun Limón (caja x24u)', 'short' => 'Helado de agua sabor limón. Caja x 24u.', 'desc' => 'Sabor limón. Helado de agua. Presentación caja x24.', 'price' => 14000, 'sale' => 12000, 'cat' => 'helados', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89045f1dd6.png', 'cost' => 7800, 'margin' => 53.8, 'stock' => 16],
        ['id' => '69c9e77d430af', 'name' => 'Ñoquis de Papa x 500gr', 'short' => 'Ñoquis de papa artesanales. Presentación x 500g.', 'desc' => 'Ñoquis de papa artesanales para toda la familia. Presentación 500 g.', 'price' => 1800, 'sale' => 1600, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c9e710b8000.jpg', 'cost' => 1030, 'margin' => 55.3, 'stock' => 75],
        ['id' => '69c9e7e4bb56e', 'name' => 'Ñoquis de Papa x 1kg', 'short' => 'Ñoquis de papa artesanales. Presentación x 1kg o bulto x10u.', 'desc' => 'Ñoquis de papa artesanales. Presentación 1 kg o bulto cerrado x10.', 'price' => 3000, 'sale' => 2780, 'cat' => 'pastas', 'badge' => '', 'img' => 'https://aapp.space/storage/images/69c2ec882de0c-69c9e710ba04b.jpg', 'cost' => 1800, 'margin' => 54.4, 'stock' => 41],
    ];

    private const DEFAULT_CLIENTS = [
        ['id' => 'c1', 'name' => 'Consumidor Final', 'address' => 'Necochea, Buenos Aires', 'phone' => '', 'email' => '', 'cuit' => '', 'tax' => 'Consumidor Final', 'notes' => ''],
        ['id' => 'c2', 'name' => 'Almacén Don José', 'address' => 'Calle 64 2901, Necochea, Buenos Aires', 'phone' => '2262-123456', 'email' => 'donjose@mail.com', 'cuit' => '20-12345678-9', 'tax' => 'Monotributista', 'notes' => 'Entrega martes y jueves'],
        ['id' => 'c3', 'name' => 'Kiosco La Esquina', 'address' => 'Avenida 59 2199, Necochea, Buenos Aires', 'phone' => '2262-234567', 'email' => 'laesquina@mail.com', 'cuit' => '27-30111222-4', 'tax' => 'Monotributista', 'notes' => ''],
        ['id' => 'c4', 'name' => 'Despensa Santa Ana', 'address' => 'Calle 85 250, Necochea, Buenos Aires', 'phone' => '2262-345678', 'email' => 'santaana@mail.com', 'cuit' => '20-28999111-5', 'tax' => 'Responsable Inscripto', 'notes' => 'Grandes volúmenes'],
        ['id' => 'c5', 'name' => 'Super Mercado Centro', 'address' => 'Avenida 58 3025, Necochea, Buenos Aires', 'phone' => '2262-456789', 'email' => 'supercentro@mail.com', 'cuit' => '30-71222333-8', 'tax' => 'Responsable Inscripto', 'notes' => ''],
        ['id' => 'c6', 'name' => 'Autoservicio Los Primos', 'address' => 'Calle 61 3348, Necochea, Buenos Aires', 'phone' => '2262-567890', 'email' => 'losprimos@mail.com', 'cuit' => '20-33777666-9', 'tax' => 'Monotributista', 'notes' => ''],
        ['id' => 'c7', 'name' => 'Minimarket Plaza', 'address' => 'Avenida 42 2601, Necochea, Buenos Aires', 'phone' => '2262-678901', 'email' => 'minimarket@mail.com', 'cuit' => '20-33000111-2', 'tax' => 'Monotributista', 'notes' => ''],
        ['id' => 'c8', 'name' => 'Almacén La Familia', 'address' => 'Calle 83 330, Necochea, Buenos Aires', 'phone' => '2262-789012', 'email' => 'lafamilia@mail.com', 'cuit' => '20-31122444-6', 'tax' => 'Consumidor Final', 'notes' => ''],
        ['id' => 'c9', 'name' => 'Distribuciones Sur', 'address' => 'Avenida 10 4022, Necochea, Buenos Aires', 'phone' => '2262-890123', 'email' => 'distr.sur@mail.com', 'cuit' => '30-70988776-1', 'tax' => 'Responsable Inscripto', 'notes' => 'Distribuidor regional'],
        ['id' => 'c10', 'name' => 'Mercado El Puente', 'address' => 'Avenida 2 3899, Necochea, Buenos Aires', 'phone' => '2262-901234', 'email' => 'elpuente@mail.com', 'cuit' => '20-29888777-3', 'tax' => 'Monotributista', 'notes' => ''],
        ['id' => 'c11', 'name' => 'Kiosco 24 Horas', 'address' => 'Calle 4 4302, Necochea, Buenos Aires', 'phone' => '2262-012345', 'email' => '', 'cuit' => '20-35544333-7', 'tax' => 'Consumidor Final', 'notes' => ''],
        ['id' => 'c12', 'name' => 'Comedor Buen Sabor', 'address' => 'Calle 87 402, Necochea, Buenos Aires', 'phone' => '2262-321098', 'email' => 'buensabor@mail.com', 'cuit' => '27-34455666-1', 'tax' => 'Monotributista', 'notes' => 'Restaurante'],
    ];

    private const DEFAULT_SLIDES = [
        ['image_url' => 'https://aapp.space/storage/store/images/usSqH9EIpZEjRAkO53Fo.png', 'title' => 'Banner 1', 'sort_order' => 0, 'is_active' => 1],
        ['image_url' => 'https://aapp.space/storage/store/images/McJ06c7ki18GY9ZSziWs.png', 'title' => 'Banner 2', 'sort_order' => 1, 'is_active' => 1],
        ['image_url' => 'https://aapp.space/storage/store/images/cRUiezU0TrsrG520D5MR.png', 'title' => 'Banner 3', 'sort_order' => 2, 'is_active' => 1],
    ];

    private const REQUIRED_HISTORICAL_PRODUCT_IMAGES = [
        '69c30deeb7a1f' => 'https://aapp.space/storage/images/69c2ec882de0c-69c30dbbc3e7d.png',
        '69c30eb05e223' => 'https://aapp.space/storage/images/69c2ec882de0c-69c49625e4a09.png',
        '69c3100355174' => 'https://aapp.space/storage/images/69c2ec882de0c-69c30ff7a3584.png',
        '69c49f59f19a6' => 'https://aapp.space/storage/images/69c2ec882de0c-69c496269320e.png',
        '69c4a49fb1004' => 'https://aapp.space/storage/images/69c2ec882de0c-69c4962631b73.png',
        '69c4a4fcc731a' => 'https://aapp.space/storage/images/69c2ec882de0c-69c496264e233.png',
        '69c4a563b886e' => 'https://aapp.space/storage/images/69c2ec882de0c-69c58f5744318.jpg',
        '69c4a5ee73e5a' => 'https://aapp.space/storage/images/69c2ec882de0c-69c4962702cc5.png',
        '69c4a675d5b8e' => 'https://aapp.space/storage/images/69c2ec882de0c-69c496271b346.png',
        '69c4a73365474' => 'https://aapp.space/storage/images/69c2ec882de0c-69c49625be8f4.png',
        '69c593ac02326' => 'https://aapp.space/storage/images/69c2ec882de0c-69c591ba518fd.jpg',
        '69c5956bb0be7' => 'https://aapp.space/storage/images/69c2ec882de0c-69c591ba50a29.jpg',
        '69c88aece4514' => 'https://aapp.space/storage/images/69c2ec882de0c-69c88960d8ece.jpg',
        '69c892aaea1a1' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89043e9d55.png',
        '69c89325d26db' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89043e9f19.png',
        '69c89420ee6af' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89045023da.png',
        '69c894b2cc6b8' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89045027ee.png',
        '69c894f917b58' => 'https://aapp.space/storage/images/69c2ec882de0c-69c89045f1dd6.png',
        '69c9e77d430af' => 'https://aapp.space/storage/images/69c2ec882de0c-69c9e710b8000.jpg',
        '69c9e7e4bb56e' => 'https://aapp.space/storage/images/69c2ec882de0c-69c9e710ba04b.jpg',
    ];

    public static function seedIfEmpty(PDO $pdo): void
    {
        $pdo->beginTransaction();

        self::seedProductsIfEmpty($pdo);
        self::seedClientsIfEmpty($pdo);
        self::seedSlidesIfEmpty($pdo);

        $pdo->commit();
    }

    public static function defaults(): array
    {
        return [
            'products' => self::DEFAULT_PRODUCTS,
            'clients' => self::DEFAULT_CLIENTS,
            'slides' => self::DEFAULT_SLIDES,
        ];
    }

    public static function verifyHistoricalSeed(PDO $pdo): array
    {
        $stmt = $pdo->query('SELECT id, img FROM products');
        $rows = $stmt->fetchAll();
        $imagesById = [];
        foreach ($rows as $row) {
            $imagesById[(string)($row['id'] ?? '')] = (string)($row['img'] ?? '');
        }

        $missing = [];
        $wrongUrl = [];

        foreach (self::REQUIRED_HISTORICAL_PRODUCT_IMAGES as $id => $expectedUrl) {
            if (!array_key_exists($id, $imagesById)) {
                $missing[] = $id;
                continue;
            }

            if ($imagesById[$id] !== $expectedUrl) {
                $wrongUrl[] = [
                    'id' => $id,
                    'expected' => $expectedUrl,
                    'actual' => $imagesById[$id],
                ];
            }
        }

        return [
            'ok' => $missing === [] && $wrongUrl === [],
            'expected_count' => count(self::REQUIRED_HISTORICAL_PRODUCT_IMAGES),
            'missing_ids' => $missing,
            'wrong_image_urls' => $wrongUrl,
        ];
    }

    private static function seedProductsIfEmpty(PDO $pdo): void
    {
        if (self::tableCount($pdo, 'products') > 0) {
            return;
        }

        $stmt = $pdo->prepare(
            'INSERT INTO products (id, name, short, description, price, sale, cat, badge, img, cost, margin, stock, payload, updated_at)
             VALUES (:id, :name, :short, :description, :price, :sale, :cat, :badge, :img, :cost, :margin, :stock, :payload, CURRENT_TIMESTAMP)'
        );

        foreach (self::DEFAULT_PRODUCTS as $product) {
            $stmt->execute([
                ':id' => $product['id'],
                ':name' => $product['name'],
                ':short' => $product['short'],
                ':description' => $product['desc'],
                ':price' => (float)$product['price'],
                ':sale' => (float)$product['sale'],
                ':cat' => $product['cat'],
                ':badge' => $product['badge'],
                ':img' => $product['img'],
                ':cost' => (float)$product['cost'],
                ':margin' => (float)$product['margin'],
                ':stock' => (int)$product['stock'],
                ':payload' => json_encode($product, JSON_UNESCAPED_UNICODE),
            ]);
        }
    }

    private static function seedClientsIfEmpty(PDO $pdo): void
    {
        if (self::tableCount($pdo, 'clients') > 0) {
            return;
        }

        $stmt = $pdo->prepare(
            'INSERT INTO clients (id, name, address, phone, email, cuit, tax, notes, payload, updated_at)
             VALUES (:id, :name, :address, :phone, :email, :cuit, :tax, :notes, :payload, CURRENT_TIMESTAMP)'
        );

        foreach (self::DEFAULT_CLIENTS as $client) {
            $stmt->execute([
                ':id' => $client['id'],
                ':name' => $client['name'],
                ':address' => $client['address'],
                ':phone' => $client['phone'],
                ':email' => $client['email'],
                ':cuit' => $client['cuit'],
                ':tax' => $client['tax'],
                ':notes' => $client['notes'],
                ':payload' => json_encode($client, JSON_UNESCAPED_UNICODE),
            ]);
        }
    }

    private static function seedSlidesIfEmpty(PDO $pdo): void
    {
        if (self::tableCount($pdo, 'slides') > 0) {
            return;
        }

        $stmt = $pdo->prepare(
            'INSERT INTO slides (image_url, title, sort_order, is_active)
             VALUES (:image_url, :title, :sort_order, :is_active)'
        );

        foreach (self::DEFAULT_SLIDES as $slide) {
            $stmt->execute([
                ':image_url' => $slide['image_url'],
                ':title' => $slide['title'],
                ':sort_order' => (int)$slide['sort_order'],
                ':is_active' => (int)$slide['is_active'],
            ]);
        }
    }

    private static function tableCount(PDO $pdo, string $table): int
    {
        $stmt = $pdo->query(sprintf('SELECT COUNT(*) AS total FROM %s', $table));
        $row = $stmt->fetch();

        return (int)($row['total'] ?? 0);
    }
}
