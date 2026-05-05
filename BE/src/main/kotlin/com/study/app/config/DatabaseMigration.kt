package com.study.app.config

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.ApplicationListener
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * SQLite 스키마 마이그레이션 컴포넌트
 * quiz 테이블의 study_log_id, quiz_config_id 컬럼을 NULL 허용으로 변경 (학습 기록 삭제 시 soft-delete 지원)
 */
@Component
@ConditionalOnProperty(name = ["app.db.migration.enabled"], havingValue = "true", matchIfMissing = true)
class DatabaseMigration(
    private val jdbcTemplate: JdbcTemplate
) : ApplicationListener<ApplicationReadyEvent> {

    private val logger = LoggerFactory.getLogger(javaClass)

    override fun onApplicationEvent(event: ApplicationReadyEvent) {
        migrateQuizTableIfNeeded()
    }

    @Transactional
    fun migrateQuizTableIfNeeded() {
        try {
            // PRAGMA table_info(quiz)로 컬럼 정보 확인
            val columns = jdbcTemplate.queryForList("PRAGMA table_info(quiz)")
            val studyLogColumn = columns.find { it["name"] == "study_log_id" }

            if (studyLogColumn == null) {
                logger.info("quiz 테이블이 없거나 study_log_id 컬럼이 없어 마이그레이션을 건너뜁니다.")
                return
            }

            // SQLite JDBC returns notnull as Integer or Long depending on driver
            val notnullValue = when (val v = studyLogColumn["notnull"]) {
                is Long -> v
                is Int -> v.toLong()
                else -> 0L
            }
            if (notnullValue == 0L) {
                logger.info("quiz 테이블 마이그레이션 불필요 (study_log_id 이미 nullable)")
                return
            }

            logger.info("quiz 테이블 마이그레이션 시작: study_log_id, quiz_config_id를 nullable로 변경")

            jdbcTemplate.execute("PRAGMA foreign_keys = OFF")
            // 기존 컬럼 순서 확인 후 명시적 컬럼 매핑으로 INSERT
            val originalColumns = columns.map { it["name"] as String }
            jdbcTemplate.execute("""
                CREATE TABLE quiz_migrated (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    quiz_config_id INTEGER NULL,
                    study_log_id INTEGER NULL,
                    question TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    queue_order INTEGER NOT NULL DEFAULT 0,
                    difficulty INTEGER NOT NULL DEFAULT 5,
                    original_quiz_id INTEGER NULL,
                    is_active_in_queue INTEGER NOT NULL DEFAULT 1,
                    created_at DATETIME
                )
            """.trimIndent())

            // 명시적 컬럼 이름으로 INSERT (순서 불일치 방지)
            val commonColumns = listOf("id", "quiz_config_id", "study_log_id", "question", "answer",
                "queue_order", "difficulty", "original_quiz_id", "is_active_in_queue", "created_at")
                .filter { originalColumns.contains(it) }
            val colList = commonColumns.joinToString(", ")
            jdbcTemplate.execute("INSERT INTO quiz_migrated ($colList) SELECT $colList FROM quiz")
            jdbcTemplate.execute("DROP TABLE quiz")
            jdbcTemplate.execute("ALTER TABLE quiz_migrated RENAME TO quiz")
            jdbcTemplate.execute("PRAGMA foreign_keys = ON")

            logger.info("quiz 테이블 마이그레이션 완료")
        } catch (e: Exception) {
            logger.error("quiz 테이블 마이그레이션 실패: ${e.message}", e)
        }
    }
}
