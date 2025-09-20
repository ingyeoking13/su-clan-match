package com.suclan.suclan.service;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.Notice;
import com.suclan.suclan.dto.NoticeDto;
import com.suclan.suclan.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

import static com.suclan.suclan.domain.QNotice.notice;
import static org.eclipse.jdt.internal.compiler.problem.ProblemSeverities.Optional;


@Service
@Slf4j
@RequiredArgsConstructor
public class NoticeService {

  private final JPAQueryFactory jpaQueryFactory;
  private final NoticeRepository noticeRepository;

  @Transactional
  public Page<NoticeDto.Summary> getNotices(Pageable pageable, NoticeDto.SearchCondition condition){
    BooleanExpression whereCondition = (condition.getNoticeType() != null)?notice.noticeType.eq(condition.getNoticeType()):null;

    var query = jpaQueryFactory.selectFrom(notice)
        .where(notice.status.ne(EntityStatus.DELETED), whereCondition)
        .orderBy(notice.createdAt.desc())
        .offset(pageable.getOffset())
        .limit(pageable.getPageSize());

    long size = jpaQueryFactory.selectFrom(notice)
        .where(notice.status.ne(EntityStatus.DELETED), whereCondition)
        .select(notice.count())
        .fetchOne();

    List<NoticeDto.Summary> result = query.fetch().stream().map(this::convertToSummary).toList();
    return new PageImpl<>(result, pageable, size);
  }

  @Transactional
  public NoticeDto.CreateResponse createNotice(NoticeDto.CreateRequest notice) {
    Notice savedNotice = noticeRepository.save(
        Notice.builder()
            .title(notice.getTitle())
            .writer(notice.getWriter())
            .noticeType(notice.getNoticeType())
            .text(notice.getText())
            .build()
    );
    return NoticeDto.CreateResponse.builder()
        .id(savedNotice.getId())
        .build();
  }

  @Transactional
  public NoticeDto.Detail getNoticeDetail(Long noticeId) {
    Optional<Notice> notice = noticeRepository.findById(noticeId);
    if (notice.isEmpty()) {
      throw new IllegalArgumentException();
    }

    return this.convertToDetail(notice.get());
  }

  public NoticeDto.Summary convertToSummary(Notice notice) {
    return NoticeDto.Summary.builder()
        .id(notice.getId())
        .title(notice.getTitle())
        .noticeType(notice.getNoticeType())
        .writer(notice.getWriter())
        .createdAt(notice.getCreatedAt())
        .build();
  }

  public NoticeDto.Detail convertToDetail(Notice notice) {
    return NoticeDto.Detail.builder()
        .id(notice.getId())
        .title(notice.getTitle())
        .writer(notice.getWriter())
        .noticeType(notice.getNoticeType())
        .createdAt(notice.getCreatedAt())
        .text(notice.getText())
        .build();
  }


}
