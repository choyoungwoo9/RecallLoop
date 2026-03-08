package com.study.app.domain.studylog

import org.springframework.data.jpa.repository.JpaRepository

interface StudyLogRepository : JpaRepository<StudyLog, Long>
