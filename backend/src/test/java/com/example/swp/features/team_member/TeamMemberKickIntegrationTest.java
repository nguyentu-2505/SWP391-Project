package com.example.swp.features.team_member;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.hackathon_event.HackathonStatus;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team.TeamStatus;
import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@SpringBootTest(properties = "spring.jpa.show-sql=true")
@ActiveProfiles("test")
public class TeamMemberKickIntegrationTest {

    @Autowired
    private TeamMemberService teamMemberService;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HackathonEventRepository eventRepository;

    @Test
    public void testKickMember() {
        // Setup data
        String uuid = java.util.UUID.randomUUID().toString();
        String leaderUsername = "leader1" + uuid;
        User leader = User.builder().username(leaderUsername).email("leader" + uuid + "@test.com").role(Role.PARTICIPANT).approved(true).verified(true).fptStudentId("FPT123" + uuid).password("pass").build();
        User member = User.builder().username("member1" + uuid).email("member" + uuid + "@test.com").role(Role.PARTICIPANT).approved(true).verified(true).fptStudentId("FPT124" + uuid).password("pass").build();
        userRepository.save(leader);
        userRepository.save(member);

        HackathonEvent event = HackathonEvent.builder().name("Test Event").slug("test-event" + uuid).status(HackathonStatus.PUBLISHED).startTime(LocalDateTime.now()).endTime(LocalDateTime.now().plusDays(2)).registrationStart(LocalDateTime.now().minusDays(1)).registrationEnd(LocalDateTime.now().plusDays(1)).minTeamSize(2).maxTeamSize(5).build();
        eventRepository.save(event);

        Team team = Team.builder().name("Test Team").event(event).status(TeamStatus.ACTIVE).build();
        teamRepository.save(team);

        TeamMember leaderMembership = TeamMember.builder().team(team).user(leader).isLeader(true).build();
        TeamMember memberMembership = TeamMember.builder().team(team).user(member).isLeader(false).build();
        teamMemberRepository.save(leaderMembership);
        teamMemberRepository.save(memberMembership);

        List<TeamMember> list = new ArrayList<>();
        list.add(leaderMembership);
        list.add(memberMembership);
        team.setTeamMembers(list);
        teamRepository.save(team);
        teamMemberRepository.save(leaderMembership);
        teamMemberRepository.save(memberMembership);

        // Set security context
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(leaderUsername, "pass")
        );

        System.out.println("================= STARTING KICK MEMBER ====================");
        teamMemberService.kickMember(member.getId(), team.getId());
        System.out.println("================= FINISHED KICK MEMBER ====================");
        
        // Assertions
        List<TeamMember> membersAfter = teamMemberRepository.findByTeamId(team.getId());
        System.out.println("Members count after kick: " + membersAfter.size());
    }
}
