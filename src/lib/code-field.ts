// Deterministic background "code field" so server and client render the same text.
const WORDS = [
  "heartbeat()", "lease_until", "FOR UPDATE SKIP LOCKED", "retry(backoff=2^n)",
  "dead_letter", "@Transactional", "async def", "jwt.verify", "RBAC",
  "docker compose up", "SELECT", "INSERT", "{", "}", "=>", "::", "01", "10",
  "//", "#", "git push", "redis.get", "lightgbm", "POST /api", "200 OK",
  "queue.poll()", "worker-3", "prisma.migrate", "fastapi", "spring.boot",
];

function build(rows: number, cols: number) {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    let line = "";
    while (line.length < cols) line += WORDS[Math.floor(rnd() * WORDS.length)] + "  ";
    lines.push(line);
  }
  return lines.join("\n");
}

// Enough to cover a large monitor; the layer is clipped to the viewport.
export const CODE_FIELD = build(70, 320);
