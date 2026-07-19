<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metodo non consentito']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    $input = $_POST;
}

$nome     = trim($input['nome'] ?? '');
$email    = trim($input['email'] ?? '');
$azienda  = trim($input['azienda'] ?? '');
$messaggio = trim($input['messaggio'] ?? '');

// Validazione
$errors = [];
if (empty($nome))     $errors[] = 'Il nome è obbligatorio';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email non valida';
if (empty($azienda))  $errors[] = "L'azienda è obbligatoria";
if (empty($messaggio)) $errors[] = 'Il messaggio è obbligatorio';

// Protezione da email injection
if (preg_match('/[\r\n]/', $nome) || preg_match('/[\r\n]/', $email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dati non validi']);
    exit;
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Anti-spam: honeypot (se il campo hidden è compilato = bot)
if (!empty($input['website'])) {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

$to      = 'info@sarconx.com';
$subject = 'Richiesta consulenza dal sito SarconX';
$boundary = md5(time());

$headers  = "From: noreply@sarconx.it\r\n";
$headers .= "Reply-To: $nome <$email>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

// Versione testo
$text_body  = "Nuova richiesta dal sito SarconX\n";
$text_body .= str_repeat('-', 40) . "\n\n";
$text_body .= "Nome: $nome\n";
$text_body .= "Email: $email\n";
$text_body .= "Azienda: $azienda\n\n";
$text_body .= "Messaggio:\n$messaggio\n\n";
$text_body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n";
$text_body .= "Data: " . date('d/m/Y H:i:s') . "\n";

// Versione HTML
$html_body  = "<html><body style='font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto'>";
$html_body .= "<div style='background:linear-gradient(135deg,#00f0ff,#8b5cf6);padding:20px;border-radius:12px 12px 0 0'>";
$html_body .= "<h1 style='color:#050510;margin:0;font-size:20px'>Nuova Richiesta — SarconX</h1>";
$html_body .= "</div>";
$html_body .= "<div style='background:#f8f9fa;padding:20px;border:1px solid #e9ecef'>";
$html_body .= "<table style='width:100%;border-collapse:collapse'>";
$html_body .= "<tr><td style='padding:8px 0;font-weight:bold;color:#666;width:100px'>Nome:</td><td style='padding:8px 0'>" . htmlspecialchars($nome) . "</td></tr>";
$html_body .= "<tr><td style='padding:8px 0;font-weight:bold;color:#666'>Email:</td><td style='padding:8px 0'><a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></td></tr>";
$html_body .= "<tr><td style='padding:8px 0;font-weight:bold;color:#666'>Azienda:</td><td style='padding:8px 0'>" . htmlspecialchars($azienda) . "</td></tr>";
$html_body .= "</table>";
$html_body .= "<hr style='border:none;border-top:1px solid #e9ecef;margin:16px 0'>";
$html_body .= "<p style='font-weight:bold;color:#666;margin-bottom:8px'>Messaggio:</p>";
$html_body .= "<p style='background:#fff;padding:16px;border-radius:8px;border:1px solid #e9ecef;line-height:1.6'>" . nl2br(htmlspecialchars($messaggio)) . "</p>";
$html_body .= "<hr style='border:none;border-top:1px solid #e9ecef;margin:16px 0'>";
$html_body .= "<p style='font-size:12px;color:#999'>IP: " . htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'N/A') . " — " . date('d/m/Y H:i:s') . "</p>";
$html_body .= "</div></body></html>";

$message  = "--$boundary\r\n";
$message .= "Content-Type: text/plain; charset=utf-8\r\n";
$message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$message .= $text_body . "\r\n\r\n";
$message .= "--$boundary\r\n";
$message .= "Content-Type: text/html; charset=utf-8\r\n";
$message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$message .= $html_body . "\r\n\r\n";
$message .= "--$boundary--\r\n";

$success = mail($to, $subject, $message, $headers);

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Email inviata con successo']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Errore nell\'invio. Riprova più tardi.']);
}
