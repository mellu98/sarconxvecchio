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

/* ------------------------------------------------------------------
 * SMTP config via environment variables (set in Coolify)
 * Defaults point to the real SarconX mail server (mail.sarconx.com).
 * NOTE: do NOT use "sarconx.com" as host — the bare domain now points
 * to the Coolify VPS (no mail server there). mail.sarconx.com is the
 * actual SMTP host of the shared mail provider.
 * ------------------------------------------------------------------ */
$smtpHost = getenv('SMTP_HOST') ?: 'mail.sarconx.com';
$smtpPort = (int)(getenv('SMTP_PORT') ?: 465);
$smtpUser = getenv('SMTP_USER') ?: 'noreply@sarconx.com';
$smtpPass = getenv('SMTP_PASS') ?: '';
$fromAddr = getenv('SMTP_FROM') ?: $smtpUser;
$toAddr   = getenv('MAIL_TO')   ?: 'info@sarconx.com';

if ($smtpPass === '') {
    http_response_code(500);
    error_log('[send-email] SMTP_PASS env var non impostata');
    echo json_encode(['success' => false, 'message' => 'Configurazione email mancante sul server.']);
    exit;
}

$subject = 'Richiesta consulenza dal sito SarconX';
$boundary = md5(time());

// Versione testo
$text_body  = "Nuova richiesta dal sito SarconX\n";
$text_body .= str_repeat('-', 40) . "\n\n";
$text_body .= "Nome: $nome\n";
$text_body .= "Email: $email\n";
$text_body .= "Azienda: $azienda\n\n";
$text_body .= "Messaggio:\n$messaggio\n\n";
$text_body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n";
$text_body .= "Data: " . date('d/m/Y H:i:s') . "\n";

// Versione HTML (palette nuova: bianco + ink + accent blu)
$accent = '#0038FF';
$ink    = '#0A0A0A';
$muted  = '#6B7280';
$line   = '#E5E7EB';
$html_body  = "<html><body style='font-family:Arial,sans-serif;color:$ink;max-width:600px;margin:0 auto'>";
$html_body .= "<div style='background:$accent;padding:20px;border-radius:12px 12px 0 0'>";
$html_body .= "<h1 style='color:#fff;margin:0;font-size:20px'>Nuova Richiesta — SarconX</h1>";
$html_body .= "</div>";
$html_body .= "<div style='background:#ffffff;padding:20px;border:1px solid $line;border-top:0;border-radius:0 0 12px 12px'>";
$html_body .= "<table style='width:100%;border-collapse:collapse'>";
$html_body .= "<tr><td style='padding:8px 0;font-weight:bold;color:$muted;width:100px'>Nome:</td><td style='padding:8px 0;color:$ink'>" . htmlspecialchars($nome) . "</td></tr>";
$html_body .= "<tr><td style='padding:8px 0;font-weight:bold;color:$muted'>Email:</td><td style='padding:8px 0;color:$ink'><a href='mailto:" . htmlspecialchars($email) . "' style='color:$accent'>" . htmlspecialchars($email) . "</a></td></tr>";
$html_body .= "<tr><td style='padding:8px 0;font-weight:bold;color:$muted'>Azienda:</td><td style='padding:8px 0;color:$ink'>" . htmlspecialchars($azienda) . "</td></tr>";
$html_body .= "</table>";
$html_body .= "<hr style='border:none;border-top:1px solid $line;margin:16px 0'>";
$html_body .= "<p style='font-weight:bold;color:$muted;margin-bottom:8px'>Messaggio:</p>";
$html_body .= "<p style='background:#F7F8FA;padding:16px;border-radius:8px;border:1px solid $line;line-height:1.6;color:$ink'>" . nl2br(htmlspecialchars($messaggio)) . "</p>";
$html_body .= "<hr style='border:none;border-top:1px solid $line;margin:16px 0'>";
$html_body .= "<p style='font-size:12px;color:$muted'>IP: " . htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'N/A') . " — " . date('d/m/Y H:i:s') . "</p>";
$html_body .= "</div></body></html>";

// Corpo multipart
$body  = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=utf-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $text_body . "\r\n\r\n";
$body .= "--$boundary\r\n";
$body .= "Content-Type: text/html; charset=utf-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $html_body . "\r\n\r\n";
$body .= "--$boundary--\r\n";

// Header RFC 5322 completi (To + Subject inclusi per il blocco DATA)
$headers  = "From: SarconX <noreply@sarconx.com>\r\n";
$headers .= "To: $toAddr\r\n";
$headers .= "Subject: $subject\r\n";
$headers .= "Reply-To: $nome <$email>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

/* ------------------------------------------------------------------
 * Minimal SMTP client over implicit SSL (port 465), AUTH LOGIN.
 * Self-contained — no external dependency.
 * ------------------------------------------------------------------ */
function smtp_send($host, $port, $user, $pass, $from, $to, $fullHeaders, $body, &$error) {
    $remote = 'ssl://' . $host . ':' . $port;
    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer'      => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false,
        ],
    ]);
    $fp = @stream_socket_client($remote, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) { $error = "connessione a $remote fallita: $errstr ($errno)"; return false; }

    $readln = function () use ($fp) {
        $data = '';
        while (!feof($fp)) {
            $line = fgets($fp, 515);
            if ($line === false) break;
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') break; // ultima riga di una risposta multilinea
        }
        return $data;
    };
    $cmd = function ($c) use ($fp) { fwrite($fp, $c . "\r\n"); };
    $expect = function ($code) use ($readln, &$error) {
        $resp = $readln();
        if (strpos($resp, (string)$code) !== 0) {
            $error = "atteso $code, ricevuto: " . trim($resp);
            return false;
        }
        return true;
    };

    if (!$expect(220)) { fclose($fp); return false; }

    $cmd('EHLO sarconx.com');
    if (!$expect(250)) { fclose($fp); return false; }

    $cmd('AUTH LOGIN');
    $r = $readln();
    if (strpos($r, '334') !== 0) { $error = 'AUTH LOGIN non supportato: ' . trim($r); fclose($fp); return false; }

    $cmd(base64_encode($user));
    $r = $readln();
    if (strpos($r, '334') !== 0) { $error = 'username rifiutato: ' . trim($r); fclose($fp); return false; }

    $cmd(base64_encode($pass));
    $r = $readln();
    if (strpos($r, '235') !== 0) { $error = 'autenticazione fallita (credenziali errate): ' . trim($r); fclose($fp); return false; }

    $cmd('MAIL FROM: <' . $from . '>');
    if (!$expect(250)) { fclose($fp); return false; }

    $cmd('RCPT TO: <' . $to . '>');
    if (!$expect(250)) { fclose($fp); return false; }

    $cmd('DATA');
    if (!$expect(354)) { fclose($fp); return false; }

    // Dot-stuffing + terminazione
    $payload = preg_replace('/^\./m', '..', $fullHeaders . "\r\n" . $body);
    fwrite($fp, $payload . "\r\n.\r\n");
    if (!$expect(250)) { fclose($fp); return false; }

    $cmd('QUIT');
    fclose($fp);
    return true;
}

$err = null;
$ok = smtp_send($smtpHost, $smtpPort, $smtpUser, $smtpPass, $fromAddr, $toAddr, $headers, $body, $err);

if ($ok) {
    echo json_encode(['success' => true, 'message' => 'Email inviata con successo']);
} else {
    http_response_code(500);
    error_log('[send-email] SMTP errore: ' . $err);
    echo json_encode(['success' => false, 'message' => 'Errore nell\'invio. Riprova più tardi.']);
}
