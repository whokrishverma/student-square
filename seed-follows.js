import Database from "better-sqlite3";
const db = new Database("./server/data/studentsquare.db");

// Run migrations (will create follows table)
db.exec(`
  CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
  );
`);

const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='follows'").get();

if (tableExists) {
  const count = db.prepare("SELECT COUNT(*) as cnt FROM follows").get().cnt;
  if (count === 0) {
    console.log("Seeding follows...");
    const insertSeedFollow = db.prepare(
      "INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)"
    );
    const seedFollowsInsert = db.transaction(() => {
      insertSeedFollow.run(1, 2);
      insertSeedFollow.run(1, 3);
      insertSeedFollow.run(1, 4);
      insertSeedFollow.run(2, 1);
      insertSeedFollow.run(2, 5);
      insertSeedFollow.run(3, 1);
      insertSeedFollow.run(3, 7);
      insertSeedFollow.run(3, 10);
      insertSeedFollow.run(5, 1);
    });
    seedFollowsInsert();
    console.log("Follows seeded.");
  } else {
    console.log("Follows already seeded.");
  }
}
