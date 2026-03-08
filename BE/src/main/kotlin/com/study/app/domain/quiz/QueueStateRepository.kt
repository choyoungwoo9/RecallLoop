package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository

interface QueueStateRepository : JpaRepository<QueueState, Long>
