# Risk Register - Smart Restaurant

## Risk Matrix

| Probability \ Impact | Low | Medium | High |
|---------------------|-----|--------|------|
| **High** | 🟡 | 🟠 | 🔴 |
| **Medium** | 🟢 | 🟡 | 🟠 |
| **Low** | 🟢 | 🟢 | 🟡 |

---

## Identified Risks

| ID | Risk | Category | Probability | Impact | Risk Level | Owner |
|----|------|----------|-------------|--------|------------|-------|
| R1 | Socket.IO complexity cao hơn dự kiến | Technical | High | High | 🔴 | Dev B |
| R2 | Time overrun - không kịp deadline | Schedule | Medium | High | 🟠 | Dev A |
| R3 | Payment integration phức tạp | Technical | Medium | Medium | 🟡 | Dev B |
| R4 | Bug trong Demo | Quality | Medium | High | 🟠 | Dev C |
| R5 | Team member bệnh/vắng | Resource | Low | High | 🟡 | Dev A |
| R6 | Database design thay đổi giữa chừng | Technical | Medium | Medium | 🟡 | Dev B |
| R7 | Thiếu test coverage | Quality | Medium | Medium | 🟡 | Dev C |
| R8 | Deploy failed vào ngày cuối | Technical | Low | High | 🟡 | Dev B |

---

## Risk Response Plan

### R1: Socket.IO Complexity 🔴

**Description:** Real-time features (KDS, order updates) có thể phức tạp hơn dự kiến

**Mitigation:**
- Dev B bắt đầu Socket.IO từ Day 1
- Tạo POC (proof of concept) trong Sprint 0
- Sử dụng thư viện có documentation tốt

**Contingency:**
- Fallback: Polling thay vì real-time
- Cut bớt real-time features nếu cần

---

### R2: Time Overrun 🟠

**Description:** Không hoàn thành đủ features trong 20 ngày

**Mitigation:**
- Xác định MVP rõ ràng
- Daily standup track progress
- Weekly review điều chỉnh scope

**Contingency:**
- Cut Reports nếu cần
- Cut advanced features (fuzzy search, multi-language)

---

### R3: Payment Integration 🟡

**Description:** Stripe/VNPay integration có thể mất thời gian

**Mitigation:**
- Sử dụng Stripe test mode
- Mock payment cho development

**Contingency:**
- Demo với mock payment
- Show "Pay at counter" flow thay thế

---

### R4: Bug trong Demo 🟠

**Description:** App có bug khi demo trước giảng viên

**Mitigation:**
- Code freeze Day 18
- Rehearsal demo Day 19
- Prepare fallback data

**Contingency:**
- Pre-recorded backup video
- Run on localhost if cloud fails

---

### R5: Team Member Unavailable 🟡

**Description:** 1 thành viên bệnh hoặc vắng

**Mitigation:**
- Cross-training giữa Frontend/Backend cơ bản
- Document tất cả setup steps
- Pair programming cho critical features

**Contingency:**
- Redistribute tasks
- Focus on MVP only

---

### R6: Database Changes 🟡

**Description:** Schema cần thay đổi giữa project

**Mitigation:**
- Finalize ERD trong Sprint 0
- Use migrations cho mọi changes
- Review schema trước Sprint 1

**Contingency:**
- Migration scripts ready
- Backward compatible changes

---

### R7: Thiếu Test Coverage 🟡

**Description:** Không có thời gian test kỹ

**Mitigation:**
- Manual test cases viết trước
- Test trong mỗi sprint
- Dev C focus QA

**Contingency:**
- Priority test cho demo flow
- Smoke test before demo

---

### R8: Deploy Failed 🟡

**Description:** Deployment không thành công vào ngày cuối

**Mitigation:**
- Test deploy từ Day 17
- Prepare deployment runbook
- Have backup hosting plan

**Contingency:**
- Demo on localhost
- Use ngrok/localtunnel

---

## Risk Monitoring

Review risks trong mỗi Sprint Retrospective:
- [ ] Sprint 1 Review - 09/01/2026
- [ ] Sprint 2 Review - 14/01/2026
- [ ] Sprint 3 Review - 18/01/2026
- [ ] Sprint 4 Review - 20/01/2026
- [ ] Final Review - 22/01/2026

---

*Document Version: 1.0 | Last Updated: 03/01/2026*
