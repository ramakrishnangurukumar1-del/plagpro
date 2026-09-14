package com.plagiarism.backend.repository;

import com.plagiarism.backend.model.Document;
import com.plagiarism.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByOwnerOrderByUploadedAtDesc(User owner);
    List<Document> findAllByOrderByUploadedAtDesc();
}
