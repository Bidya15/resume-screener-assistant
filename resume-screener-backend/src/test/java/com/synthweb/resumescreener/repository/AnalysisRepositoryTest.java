package com.synthweb.resumescreener.repository;

import com.synthweb.resumescreener.entity.Analysis;
import com.synthweb.resumescreener.entity.InterviewQuestion;
import com.synthweb.resumescreener.entity.MatchingSkill;
import com.synthweb.resumescreener.entity.SkillGap;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Runs against the real PostgreSQL test database (JSONB needs the real thing). */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class AnalysisRepositoryTest {

    @Autowired
    private AnalysisRepository repository;

    @Autowired
    private TestEntityManager em;

    private Analysis persist(String name, Integer score) throws InterruptedException {
        Analysis a = Analysis.builder()
                .candidateName(name)
                .jobDescription("Job description for " + name)
                .resumeText("Resume of " + name)
                .matchScore(score)
                .overallAssessment("Assessment")
                .build();
        Analysis saved = em.persistAndFlush(a);
        Thread.sleep(5); // keep createdAt strictly increasing for ordering assertions
        return saved;
    }

    @Test
    void jsonbColumnsRoundTrip() {
        Analysis a = Analysis.builder()
                .candidateName("Jane Doe")
                .jobDescription("JD")
                .resumeText("CV")
                .matchScore(82)
                .overallAssessment("Strong")
                .matchingSkills(List.of(new MatchingSkill("Java", "Extensive enterprise experience", "8 years at ACME")))
                .skillGaps(List.of(new SkillGap("Kubernetes", "No orchestration mentioned", "Kubernetes experience required", "missing_evidence")))
                .interviewQuestions(List.of(new InterviewQuestion("Describe a hard bug", "Evaluate debugging methodology", "Problem Solving")))
                .build();

        Long id = em.persistAndFlush(a).getId();
        em.clear(); // force a real read from PostgreSQL

        Analysis loaded = repository.findById(id).orElseThrow();
        assertThat(loaded.getCreatedAt()).isNotNull();
        assertThat(loaded.getMatchingSkills()).containsExactly(new MatchingSkill("Java", "Extensive enterprise experience", "8 years at ACME"));
        assertThat(loaded.getSkillGaps()).containsExactly(new SkillGap("Kubernetes", "No orchestration mentioned", "Kubernetes experience required", "missing_evidence"));
        assertThat(loaded.getInterviewQuestions())
                .containsExactly(new InterviewQuestion("Describe a hard bug", "Evaluate debugging methodology", "Problem Solving"));
    }

    @Test
    void findAllIsNewestFirst() throws Exception {
        persist("First", 10);
        persist("Second", 20);
        persist("Third", 30);

        assertThat(repository.findAllByOrderByCreatedAtDesc())
                .extracting(Analysis::getCandidateName)
                .containsExactly("Third", "Second", "First");
    }

    @Test
    void searchByCandidateNameIsCaseInsensitiveAndPartial() throws Exception {
        persist("Alice Johnson", 50);
        persist("Bob Smith", 60);

        assertThat(repository.findByCandidateNameContainingIgnoreCaseOrderByCreatedAtDesc("JOHN"))
                .extracting(Analysis::getCandidateName)
                .containsExactly("Alice Johnson");
    }

    @Test
    void specificationTreatsLikeWildcardsLiterally() throws Exception {
        persist("100% Match", 90);
        persist("Another Person", 40);

        List<Analysis> found = repository.findAll(AnalysisSpecifications.candidateNameContains("%"));
        assertThat(found).extracting(Analysis::getCandidateName).containsExactly("100% Match");
    }

    @Test
    void filterByScoreRangeIsInclusive() throws Exception {
        persist("Low", 20);
        persist("Mid", 50);
        persist("High", 90);

        assertThat(repository.findByMatchScoreBetweenOrderByCreatedAtDesc(50, 90))
                .extracting(Analysis::getCandidateName)
                .containsExactly("High", "Mid");

        Specification<Analysis> spec = AnalysisSpecifications.scoreAtLeast(40)
                .and(AnalysisSpecifications.scoreAtMost(60));
        assertThat(repository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt")))
                .extracting(Analysis::getCandidateName)
                .containsExactly("Mid");
    }

    @Test
    void recentAnalysesAreLimitedByPageable() throws Exception {
        for (int i = 1; i <= 4; i++) {
            persist("Candidate " + i, i * 10);
        }

        assertThat(repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 2)))
                .extracting(Analysis::getCandidateName)
                .containsExactly("Candidate 4", "Candidate 3");
    }

    @Test
    void aggregateAndBandCounts() throws Exception {
        persist("A", 90);
        persist("B", 50);
        persist("C", 20);

        AnalysisRepository.ScoreAggregate agg = repository.aggregateScores();
        assertThat(agg.getTotal()).isEqualTo(3L);
        assertThat(agg.getAverage()).isCloseTo(53.33, org.assertj.core.data.Offset.offset(0.01));
        assertThat(agg.getMax()).isEqualTo(90);
        assertThat(agg.getMin()).isEqualTo(20);

        assertThat(repository.countByMatchScoreGreaterThanEqual(70)).isEqualTo(1);
        assertThat(repository.countByMatchScoreBetween(40, 69)).isEqualTo(1);
        assertThat(repository.countByMatchScoreLessThan(40)).isEqualTo(1);
    }

    @Test
    void aggregateOnEmptyTableReturnsZeroTotalAndNulls() {
        AnalysisRepository.ScoreAggregate agg = repository.aggregateScores();
        assertThat(agg.getTotal()).isZero();
        assertThat(agg.getAverage()).isNull();
        assertThat(agg.getMax()).isNull();
    }
}
