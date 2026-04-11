# 📝 Notes

Apr 10, 2026

## RTUSA | True Aim \- Workshop

Invited [Alin Koppandi](mailto:akoppandi@trueaim.ai) [Steve Cory](mailto:steve@oaksure.co.za) [mike@rtusa.co.za](mailto:mike@rtusa.co.za) [Frederic Brunner](mailto:fbrunner@trueaim.ai) [Reuben John](mailto:rjohn@trueaim.ai) [vassen@rtusa.co.za](mailto:vassen@rtusa.co.za) [matthew.rosenberg@4gh.co.za](mailto:matthew.rosenberg@4gh.co.za)

Attachments [RTUSA | True Aim - Workshop](https://calendar.google.com/calendar/event?eid=MHRqaXBjOWk4Zmk5ODBoajhlc3JyYXI2dXMgcmpvaG5AdHJ1ZWFpbS5haQ)

Meeting records [Transcript](https://docs.google.com/document/d/18229s8GNqd4IlF0I5ex_1AHIR7swWb27fmaT45vfS70/edit?usp=drive_web&tab=t.nmv03r7ycnlh) 

### Summary

Prototype demo for the claims work queue covered SLA status and process flows, with an agreement to fully replace Zoho functionality for claims communications.

**Industry Regulation and Operations**  
The South African insurance market currently lacks formal regulation for their active 10-year industry, necessitating efforts to bring the industry in line. Operational representatives were confirmed to drive the discussion and address gaps on outstanding items during the prototype demo session.

**Claims Work Queue Prototype Demo**  
The prototype demonstrated a claims work queue for agents featuring color-coded Service Level Agreement status and variable process steps for different claim types. A major requirement was raised for the system to manage both outbound and inbound communications for a centralized audit trail, fully replacing the current Zoho functionality.

**Document Handling and Final Process**  
A critical challenge of missing mandatory documents was addressed by confirming that SLAs are paused to accelerate the assessment process for non-material documents. The workflow includes a necessary final repair completion step, and the team decided to create a sandbox environment starting with glass claims to test the simplest use case.

### Next steps

- [ ] \[Frederic Brunner\] Document View: Build functionality for a unified view of claim documents within the system.

- [ ] \[Frederic Brunner\] Assessor Link: Implement a communication link allowing the assessor to upload required documents directly.

- [ ] \[Frederic Brunner\] FRC Process: Integrate the final settlement step (FRC process) into the claim workflow based on collected feedback.

- [ ] \[Frederic Brunner\] Export Dashboard: Build an export feature enabling users to download dashboard reports dynamically.

- [ ] \[Reuben John\] Schedule Followup: Organize a follow-up session to thoroughly discuss the communication plan structure, triggers, and metrics.

- [ ] \[Frederic Brunner\] Release Demo: Provide the current claims demo to the client team for initial testing and feedback collection.

- [ ] \[The group\] Detail ROCK: Provide documentation detailing ROCK system functionality and required integration capabilities.

- [ ] \[The group\] Define Forms: Provide necessary form requirements to enable direct True AIM glass claim submission testing.

- [ ] \[Frederic Brunner\] Create Sandbox: Create a sandbox environment dedicated to testing the glass claim workflow.

- [ ] \[Mike Mgodeli\] Submit Data: Scrape claim data and send through to the team with all supporting documentation.

- [ ] \[The group\] Internal Discussion: Discuss internally to determine required information from Mike Mgodeli.

- [ ] \[The group\] Send Summary: Email Mike Mgodeli summarizing required information, priorities, timelines, and the plan going forward.

### Details

* **Discussion of Industry Context and Regulation**: Vassen Moodley noted that they had recently concluded an insurer meeting where initiatives related to their processes were discussed, and there is excitement surrounding them ([00:00:00](#00:00:00)). The work is in a space that is relatively new to the South African market, which has been active for over 10 years but is not currently formally regulated. Their efforts are focused on bringing the industry in line, and Reuben John expressed hope to contribute to these efforts ([00:02:13](#00:02:13)).

* **Meeting Attendees and Operational Focus**: The attendees confirmed that Mike Mgodeli and Vassen Moodley were the primary representatives for the day, though Steve might potentially join later, while Matthew and Alin Koppandi were also present. Mike Mgodeli and Vassen Moodley confirmed that they are driving the operational side and would be able to answer questions and close gaps on outstanding items during the session ([00:03:21](#00:03:21)). Frederic Brunner intended to begin the session by presenting a demo of an initial prototype ([00:04:15](#00:04:15)) ([00:06:48](#00:06:48)).

* **Setting the Stage for the Prototype Demo**: Reuben John asked Mike Mgodeli if it was convenient to start the demo, emphasizing that the presentation would be highly visual and engaging ([00:04:15](#00:04:15)). Frederic Brunner then explained that the system prototype was an initial model based on prior discussions, and while not 100% correct, it was intended to demonstrate their understanding and gather initial feedback ([00:06:48](#00:06:48)). Reuben John mentioned that they would start the demo once Mike Mgodeli was set up ([00:05:10](#00:05:10)).

* **Overview of the Claims Work Queue Prototype**: Frederic Brunner introduced a claims work queue prototype designed for claims agents or consultants. The queue displays a list of claims with assigned individuals, allows filtering by claim type, and uses color coding to indicate Service Level Agreement (SLA) status. Claims overdue or out of SLA appear in red, approaching SLAs appear in yellow, and fine claims are not highlighted ([00:08:21](#00:08:21)).

* **SLA and Process Progression in the Prototype**: The system is designed to dynamically flag more claims as their SLAs approach, which was demonstrated by simulating a one-hour clock advance. The prototype also provides visibility into the progress of a claim, showing that different claim types, such as glass versus accident claims, have a variable number of process steps. Mike Mgodeli inquired about the update date visible on the right, and Frederic Brunner clarified that it was intended to reflect the last update when changes are made within the claim ([00:09:30](#00:09:30)).

* **Claim Creation and Policy Validation Workflow**: Frederic Brunner demonstrated starting a new accident claim, noting that claim creation methods (e.g., from a form, webhook, or uploaded document) still need to be finalized ([00:10:35](#00:10:35)). Currently, no SLA kicks in until an agent confirms the initial claim registration and proceeds with policy validation. Once confirmed, an SLA begins, requiring policy confirmation on Nimbus within 12 hours, followed by entry of policy and excess details before proceeding ([00:11:35](#00:11:35)).

* **Claim Registration on Rock and Assessor Appointment**: Following policy validation, agents must register the claim on rock, obtain an SPM claim number, and enter it into the system, with a four-hour SLA for this step. Once registration is confirmed, the next step is appointing an assessor from a list, which Frederic Brunner demonstrated by selecting "Peter" ([00:12:54](#00:12:54)). The system is capable of automatically generating acknowledgment emails for the policyholder, broker, and assessor, which can be copied or marked as sent ([00:13:59](#00:13:59)).

* **Communication Audit Trail Requirements**: Mike Mgodeli raised a critical point about managing communications, requesting the ability for agents to send communications directly from the system and for responses to be logged there ([00:13:59](#00:13:59)). The goal is to have a centralized audit trail within the system, replacing the current use of Zoho for this function, which is necessary for agents to handle follow-ups, even on claims not assigned to them. Frederic Brunner acknowledged the requirement for visibility of communication trails but expressed caution about replicating a full mailbox system, which would add complexity ([00:16:09](#00:16:09)) ([00:19:20](#00:19:20)).

* **Full Claims Communication Audit and Zoho Replacement**: Mike Mgodeli elaborated on the need for the system to manage both outbound and inbound communications to ensure a complete claim trail and accurate SLA measurement ([00:21:49](#00:21:49)). Mike Mgodeli confirmed that they intend for the new system to entirely replace Zoho for claims management to centralize workflow and reduce multiple touch points for agents ([00:18:21](#00:18:21)) ([00:27:08](#00:27:08)). Frederic Brunner clarified that while agents use Google as their primary mailbox, Zoho currently provides the claims-specific view of those communications ([00:28:00](#00:28:00)).

* **Claim Intake Methods and Document Handling**: Mike Mgodeli outlined that claim intake could be implemented via a form embedded on their website or by processing claim forms received through a WhatsApp bot ([00:24:04](#00:24:04)) ([00:28:51](#00:28:51)). Vassen Moodley then asked how the system would handle supporting documents required by the assessor, such as claim forms, photographs, and reports, which are currently sent via email and stored on rock ([00:30:08](#00:30:08)). It was confirmed that the required documents vary based on the type of claim ([00:32:02](#00:32:02)).

* **Managing Missing Documents and SLA Pauses**: Vassen Moodley explained that a challenge arises when mandatory documents are missing, which currently prompts them to bypass the documentation phase to allow the assessment to proceed while waiting for the outstanding information ([00:32:02](#00:32:02)). Mike Mgodeli and Vassen Moodley clarified that the assessment proceeds to accelerate the process, especially for functional vehicles, and that SLAs are paused during this wait period ([00:33:20](#00:33:20)) ([00:38:45](#00:38:45)). The core reason for this approach is to avoid delaying the entire claim cycle over non-material documents, such as a driver's license, which could add 10 days to the repair cycle ([00:36:42](#00:36:42)).

* **Document Storage and Assessor Interface**: Mike Mgodeli confirmed that the supporting documents, including the claim form, pictures, and assessor's report, should be stored within the new system as a single record for audit purposes ([00:39:47](#00:39:47)) ([00:41:44](#00:41:44)). Reuben John suggested that the system could verify required documents and offer a manual override option to proceed if documents are missing ([00:40:47](#00:40:47)). Mike Mgodeli then proposed giving the assessor a hyperlink when appointing them, allowing them to upload the assessment report directly into the system instead of sending it via email ([00:45:09](#00:45:09)).

* **Assessment Processing and Radics Benchmark Data**: Frederic Brunner demonstrated the system's ability to receive the assessment, populate the assessed amount, and compare it against Radics part benchmark data to highlight variances in pricing ([00:42:44](#00:42:44)). This process involves scraping the uploaded assessor's report to break down and compare claim components ([00:44:07](#00:44:07)). Frederic Brunner confirmed that building a direct assessor UI was not initially planned but agreed that sending a link for direct document upload is feasible ([00:45:09](#00:45:09)).

* **Internal Approvals, Repair/Total Loss Fork, and Claim Closure**: The demo continued with internal approval, which might involve the insurer if the claim amount exceeds 50,000 rands. The workflow includes a fork for repair or total loss, followed by repair quotes (which might differ from the assessment), confirmation of final cost, and starting the repair ([00:47:20](#00:47:20)). The claim is marked as closed once the repair is complete and an email is sent to the client, with full audit logs of all claim events available for export ([00:48:36](#00:48:36)).

* **Final Settlement Process and Dashboard Features**: Vassen Moodley introduced the "FRC process" (Final Repair Completion), a missing step where post-repair photographs, the final invoice, and release forms are reviewed by the assessor before final settlement. Frederic Brunner was not aware of this settlement step but confirmed they could integrate it ([00:50:12](#00:50:12)). Frederic Brunner then showed the dashboard, which displays claim volume, type, average days to close, settlement amount, compliance rates, and live SLA status ([00:53:36](#00:53:36)). Mike Mgodeli and Matthew requested features for viewing a claim timeline with interaction touchpoints and the ability to export the dashboard data for reporting ([00:55:45](#00:55:45)).

* **Next Steps and Sandbox Environment**: Frederic Brunner identified next steps, including a follow-up session on the communication plan, trigger structures, and communication metrics. They also plan to release the current demo for the team to test and provide feedback, alongside an ongoing need to understand the rock system and its integration capabilities ([00:57:29](#00:57:29)). Mike Mgodeli proposed that they begin the next phase by creating a sandbox environment for glass claims. This sandbox would include a form designed for the new system to replace the current Zoho glass claim capture, as well as a process for forwarding or integrating WhatsApp-bot claims into the new system ([00:58:53](#00:58:53)).

* **Data Scraping and Claim Processing**: Mike Mgodeli confirmed that the necessary data is available, and the backend team is working on scraping it. If Mike Mgodeli can scrape the data and send it directly with supporting documents, the team can proceed by using the baseline of the glass claim as a starting point. Frederic Brunner agreed that starting with the simplest use case and building from there is a very good approach ([00:59:59](#00:59:59)).

* **Identifying Stakeholders and Required Information**: Mike Mgodeli stated they will need to know who the "actors" are in the claim process, such as the details of the assessor, including who they are and when they are appointed. Mike Mgodeli asked the other team members to communicate what specific information they need so that the data can be prepared for them ([00:59:59](#00:59:59)). Reuben John confirmed that they will discuss this internally and then send an email summarizing all the required items based on the discussion and the plan going forward ([01:00:58](#01:00:58)).

* **Setting Timelines and Priorities**: Vassen Moodley requested that timelines be included for when the deliverables are needed to help the team meet the deadlines. Reuben John confirmed that they will prioritize the requests and provide a list of priorities to Mike Mgodeli and Vassen Moodley. The meeting concluded with Frederic Brunner and others expressing thanks ([01:00:58](#01:00:58)).

*You should review Gemini's notes to make sure they're accurate. [Get tips and learn how Gemini takes notes](https://support.google.com/meet/answer/14754931)*

*How is the quality of **these specific notes?** [Take a short survey](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=YV9sO1KZ1b_JAc6Y4VOQDxIXOAIIigIgABgDCA&detailid=standard&screenshot=false) to let us know your feedback, including how helpful the notes were for your needs.*

# 📖 Transcript

Apr 10, 2026

## RTUSA | True Aim \- Workshop \- Transcript

### 00:00:00 {#00:00:00}

   
**Reuben John:** Hi Fred. So nice running granola without glitches.  
**Frederic Brunner:** We we it's a Google meet. It's your meeting.  
**Reuben John:** I know. But still it pops up.  
**Frederic Brunner:** So  
**Reuben John:** I have no issues. Everything is smooth.  
**Frederic Brunner:** yeah. No, you're gonna You're going to feel the difference with this new  
**Reuben John:** Hi Vas.  
**Vassen Moodley:** Hello.  
**Frederic Brunner:** coughing.  
**Vassen Moodley:** How are you all?  
**Reuben John:** Good. Thanks you.  
**Vassen Moodley:** Good, thank  
**Reuben John:** Good.  
**Vassen Moodley:** you.  
**Reuben John:** Any nice plans for the weekend?  
**Vassen Moodley:** Uh, let's call it a working wicket and leave it at that.  
**Reuben John:** working.  
**Vassen Moodley:** And you  
**Reuben John:** If I find 10 minutes to socialize, I'll be over the moon. I am the same as you. It's going to be a flat out working weekend for  
**Vassen Moodley:** We've just had uh our insurer meeting uh and  
**Reuben John:** me.  
**Vassen Moodley:** uh let's say you know some of the initiatives uh built around our processes and so forth uh came up. So uh they're quite excited as well.  
   
 

### 00:02:13 {#00:02:13}

   
**Vassen Moodley:** And uh let's say you must remember the space we're playing in is pretty new to the South African market. You know it's it's about 10 years plus now. But the the thing is it hasn't been it's not regulated as such. It's not it hasn't got formality to this process itself. So uh now we trying to we we're actually bucking the trend here.  
**Reuben John:** Where?  
**Vassen Moodley:** So we bringing we're bringing in the industry in line kind of and uh okay it's all blue sky stuff for now but uh you know you have to deliver at some point in time you  
**Reuben John:** Yeah, of course.  
**Vassen Moodley:** know and yeah look forward  
**Reuben John:** Of course. Well, we hope to contribute towards your your efforts  
**Vassen Moodley:** to  
**Reuben John:** indeed.  
**Vassen Moodley:** that  
**Reuben John:** Hello, Mike.  
**Frederic Brunner:** Hello,  
**Vassen Moodley:** is he  
**Frederic Brunner:** Mike.  
**Reuben John:** He is, but And now he's off. There we go.  
**Mike Mgodeli:** Sorry. Good. I'm literally driving into my driveway. Sorry. I'll just give you two minutes or so.  
   
 

### 00:03:21 {#00:03:21}

   
**Reuben John:** Okay.  
**Mike Mgodeli:** Sorry.  
**Reuben John:** Is there anyone else joining Boston? I mean, is Matt joining or is it just it's you and Mike  
**Vassen Moodley:** Um, I think it is  
**Mike Mgodeli:** Just the two of us.  
**Reuben John:** today?  
**Mike Mgodeli:** Um Steve might connect. I know that the doctors so we can we will probably we will be able to speak up on our side and close the gaps on whatever questions we've got. Um I think more operationally and myself are driving operational side. So I think from Frederick's questions whatever items we need to solve for we can perhaps close this off today in a session. So yeah I'll just connect quickly. Give me a sec.  
**Vassen Moodley:** Yeah. But if we need somebody  
**Reuben John:** Hi Alan. Alan, can you hear us?  
**Alin Koppandi:** Yes.  
**Reuben John:** Hi Alan,  
**Alin Koppandi:** Hello.  
**Vassen Moodley:** else,  
**Reuben John:** how are you?  
**Alin Koppandi:** Good. Good. Thank you.  
**Vassen Moodley:** if we need Steve, maybe we can ping him and just ask him, you know, if uh you know,  
   
 

### 00:04:15 {#00:04:15}

   
**Reuben John:** Sorry.  
**Vassen Moodley:** if he's available and if he can um participate. But generally I think uh operationally if we can't give you the answers then whoops there's some problems  
**Mike Mgodeli:** Yeah, no worries. But I think Steve Steve on that side said he's got he's at the doctor's now.  
**Vassen Moodley:** here.  
**Mike Mgodeli:** Got a doctor's appointment now, but she said he might join in, but I think we can kick off. We won't we I don't think he'll be a a stopper for to get him online.  
**Reuben John:** Okay,  
**Frederic Brunner:** That's  
**Reuben John:** before we before we kick off,  
**Frederic Brunner:** it.  
**Reuben John:** sorry, just I think we'll do um Fred wants to show you a demo. I know that. And he's got a list of outstanding items as well. Um, Mike, are you would it be okay to start the demo now or do you want to give us 30 seconds to a minute so you can set up just so we  
**Frederic Brunner:** Sure.  
**Mike Mgodeli:** Give me give,  
**Reuben John:** can  
**Mike Mgodeli:** as Murphy would have it on, my gate is stuck.  
   
 

### 00:05:10 {#00:05:10}

   
**Mike Mgodeli:** Give me give me one minute, please.  
**Reuben John:** All good. All good. All good. It's an important part. We want to make sure that because it's it's very visual.  
**Frederic Brunner:** Sure.  
**Reuben John:** It's very engaging. We want to make sure that we get that spot on. There's Matt.  
**Vassen Moodley:** I'm  
**Reuben John:** Hi, man.  
**Vassen Moodley:** in.  
**Matthew:** Hey guys,  
**Reuben John:** How's it Matt?  
**Matthew:** how you all doing?  
**Reuben John:** Well,  
**Matthew:** Good thing.  
**Reuben John:** you all  
**Matthew:** Sorry, a few  
**Reuben John:** good.  
**Matthew:** mistakes.  
**Reuben John:** We're just waiting for Mike and when he's he's ready, we're going to start with the the demo to show you what we've built for you.  
**Matthew:** What's  
**Reuben John:** Great. Matt, is your dad up and down between um London and  
**Matthew:** Yeah. Yeah. Quite a bit.  
**Reuben John:** SA?  
**Matthew:** He's there at the moment. Um and he'll be back in the UK in two months or so. But yeah, quite a bit of back and forth. There you know.  
**Reuben John:** I'm in Zurich.  
   
 

### 00:06:48 {#00:06:48}

   
**Reuben John:** Yeah. staying here for the time being, head down and and that's it. I'll probably come to London. I told you I actually did come to London, but it was day in and day out, literally insurance conference and it was a bit packed,  
**Matthew:** Yeah.  
**Reuben John:** but the next time I'll be there for a few more days, I'll let you know.  
**Matthew:** Yeah. Miss  
**Reuben John:** Definitely.  
**Matthew:** Looks like mic dropped  
**Mike Mgodeli:** I'm back. Lovely.  
**Reuben John:** there.  
**Matthew:** off.  
**Mike Mgodeli:** Thanks,  
**Reuben John:** Okay.  
**Mike Mgodeli:** guys.  
**Reuben John:** Super. Okay,  
**Frederic Brunner:** play mic. Uh,  
**Mike Mgodeli:** Hey, how's  
**Frederic Brunner:** we've lost Vassen.  
**Reuben John:** Fred.  
**Frederic Brunner:** I don't know if it's still on.  
**Vassen Moodley:** No, I'm still  
**Frederic Brunner:** Okay, good.  
**Vassen Moodley:** here.  
**Mike Mgodeli:** it  
**Frederic Brunner:** All right.  
**Matthew:** She's fine.  
**Frederic Brunner:** Um so the way we wanted to run this session is just to show a an initial prototype based on the discussion that we've had before. So none of this is uh meant to be 100% um uh correct or anything is but I think it would be nice for you to show you uh what we've understood and not and see see what the system could look like in the future and get your feedback and start kick off kick the conversation off from there.  
   
 

### 00:08:21 {#00:08:21}

   
**Frederic Brunner:** So I've built this uh claims work queue. So this is what basically an adjuster or um uh I don't what do you call them? You call them u uh assessors. No um what's the word you're using for the people in your team?  
**Mike Mgodeli:** Change  
**Frederic Brunner:** Agents. Okay.  
**Vassen Moodley:** Oh, consultants claims  
**Frederic Brunner:** So claims consultants.  
**Mike Mgodeli:** agents.  
**Frederic Brunner:** All right.  
**Vassen Moodley:** consultants  
**Frederic Brunner:** So and you can see here there would be a list of claims with the people that are assigned. And here I can just show them. I can just view my queue and I can filter by type of claims. And then here uh what you see immediately is the the claims that this is like seat claims. Obviously this is not not only is this real data but um this uh you can see like the the the one claim the claims that are um out of SLA overdue. you can see appear in red. The ones that are approaching appear in yellow and the ones that are fine are just haven't been highlighted here.  
   
 

### 00:09:30 {#00:09:30}

   
**Frederic Brunner:** And if I go and I go I simulate like one hour delay or one hour more I advance the clock by 1 hour you can see that the system will flag more uh SLAs that need to be uh need to be resolved. You can also see um here you can see the progress where we're at in the in the process. So this glass claim has fewer steps than this accident claim. And you can see this accident claim here is further along from the process from from that one compared to that  
**Reuben John:** Fred,  
**Frederic Brunner:** one.  
**Reuben John:** I think Mike's got a  
**Frederic Brunner:** Yeah, sure.  
**Mike Mgodeli:** Thanks. Thanks, Rick.  
**Frederic Brunner:** Mike,  
**Reuben John:** question.  
**Mike Mgodeli:** Just the update,  
**Frederic Brunner:** go ahead.  
**Mike Mgodeli:** the updated on the right, is that the last date was updated or was that the what is that? The create date we still get in  
**Frederic Brunner:** Um, no, the date date on the right wasn't uh wasn't updated.  
**Mike Mgodeli:** there.  
**Frederic Brunner:** I I honestly I'm not sure if that's No, I think we should uh we should see it updated when when we change when we change something in there.  
   
 

### 00:10:35 {#00:10:35}

   
**Frederic Brunner:** For instance, I go into this claim, right? And then I see it's a glass claim, you know, we we have to act. It's telling us uh we have to add. So here we have uh SPM claim number then we confirm registration and then then and then so once we've confirmed registration that the claim was at this step then another select extend no  
**Reuben John:** Should  
**Frederic Brunner:** longer bridge and then we have to assign a repair  
**Reuben John:** we start?  
**Frederic Brunner:** that's because we're director at this step maybe I start straight.  
**Reuben John:** Maybe. Do you want to start from the beginning?  
**Frederic Brunner:** start stretch from a new claim. So let's just start from new accident claim, right?  
**Reuben John:** Yeah.  
**Frederic Brunner:** So we still have to discuss exactly how we're going to create claims in the system. It could be from a form. I know we know we we you guys um a form you get from from Zoho could be a web hook. Uh could be we're fetching some data from data somewhere.  
   
 

### 00:11:35 {#00:11:35}

   
**Frederic Brunner:** Could be that you upload a document. We still have to figure out what's the best best way. Let's assume you upload the document to us and then we create the claim from there. So from here I'm assuming we're going to have the form data. So that's already quite comprehensive. There's usually lots of data on this on these forms already. But since it hasn't been confirmed yet by you or by your agent, no SLA has kicked in yet, right? I know you've received the the form. So, this is supposed to kick in, but right now we still need you to confirm on this button and proceed with policy validation. So, we just go and confirm and then from the moment you've confirmed then the SLA is kicking in, right? We have 12 hours to register the claim on or to just confirm the the policy on on Nimbus. So now here you've got some data that the agent can potentially copy if that helps you uh work in Nimbus and then I'm going to so I think your policy number starts with RTU something and we go here we go policy number and then we're going to enter an excess amount because this is some data we need to process the claim.  
   
 

### 00:12:54 {#00:12:54}

   
**Frederic Brunner:** We need to have the excess amount at this point and so right that's all data we're going to need from Nimbus. Now we're just going to confirm and validate. And that's it. From this point, our understanding is that your agents will have to do the same registration on rock. We're happy the policy is valid. We can move on and carry on. Then uh so the same here, you know, we can copy and paste data here if that's useful for you to help the registration on rock. And then you work on rock. You get a SPM number which is your claim number. And then you just enter it into into the system. From that point on, we're happy. So we still have four hours to register the claim on on Rock. Then it's registered and then we're just going to confirm it. Right. We've registered the claim on Rock. We're happy. Now the idea is we need to uh uh appoint an assessor.  
   
 

### 00:13:59 {#00:13:59}

   
**Frederic Brunner:** So we're assuming we'll have a list of assessor here. Um here I've put some random assessor Peter. So I'm going to go and see. All right, let's just uh select Peter for this for this job. And I'm just going to confirm the appointment. And there we go. So what you can see here probably is in the communication tab you have like uh an acknowledgement of the receipt of the claim that can be sent to uh the uh the policy holder. I've got the same email with some more detail operational details for the the broker. And here when the uh assenter has been appointed you also have an email that can be copied or you can even mark it as sent if you want and send it. This is what we've sent also who can send also to the to the broker. Let's mark it at send. And Mike you have a question by all  
**Mike Mgodeli:** Sorry, sorry to stop as you're flowing.  
**Frederic Brunner:** means.  
**Mike Mgodeli:** I'll forget. So the guys could could effectively send out the com straight from here from the system right on this communications channel.  
   
 

### 00:15:11

   
**Mike Mgodeli:** When there's a response,  
**Frederic Brunner:** Uh  
**Mike Mgodeli:** does it come back in here or does it come into another another  
**Frederic Brunner:** so that's we have to decide but um what we usually see for the  
**Mike Mgodeli:** place?  
**Frederic Brunner:** first phases of a project is that normally our system would create a draft in your assess in your agent's inbox and you and your agent would just have to press and control that everything is fine, right? And then once you get really used to the VM, you see the system is working, they only have to press send. Then if you want, they can already uh send the invite, send the the thing directly from from the system. So that's something that's possible. It's no, it's we can we can create these um in your inbox and but potentially also send them directly. Here we can also just create a send button.  
**Mike Mgodeli:** Yeah.  
**Frederic Brunner:** It would send send the thing there.  
**Mike Mgodeli:** Why?  
**Frederic Brunner:** So this is this is missing.  
**Mike Mgodeli:** Why I ask that question? And you see what why we even went for instance on a Zoho point of view that when a client calls  
   
 

### 00:16:09 {#00:16:09}

   
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** in following up on a claim, right? And let's say Vos is not there and I'm handling it.  
**Frederic Brunner:** Uh-huh.  
**Mike Mgodeli:** They're going to say, "Hey, I sent you this thing weeks ago, right? And you must go get an audit trail of when the coms were going on. But if I can quickly get your ID number, I'll search for you and say, "But dude, I sent the mail was sent to you last week. You haven't responded. Like, what's your story?" You get what I'm saying? it's in one place. So that's where my thinking was around on the communication  
**Frederic Brunner:** right right so okay I understand your requirement I don't want to necessarily  
**Mike Mgodeli:** area.  
**Frederic Brunner:** propose a solution right now but I understand that you have to have a view of um a view of the claims that you're not even aren't even your the claims that you um have been assigned to you and you you should be able to answer the customer's responses, the customer requests even if it's on a claim that's not one of your claims, right?  
   
 

### 00:17:19

   
**Frederic Brunner:** Okay.  
**Mike Mgodeli:** 100%.  
**Reuben John:** And I think also just a point on that if I understand correctly also that the customer  
**Frederic Brunner:** Okay.  
**Vassen Moodley:** Sorry.  
**Reuben John:** responses are recorded here. Is that possible?  
**Matthew:** Exactly.  
**Mike Mgodeli:** Oh yeah.  
**Reuben John:** Yeah.  
**Matthew:** I think that's the critical part Mike's Mike's referring to Fred.  
**Reuben John:** Yeah.  
**Matthew:** So the communication gets sent from here, but then a response on that chain being recorded here. So you have a full sort of uh communication trail. So for example, a certain consultant's not in today. So whoever's taking over that um specific case can have full visibility on all communications um using just this section here. Mike, maybe just a question in the meantime. Do you not I know this functionality is at least part built into Nimbus. Uh are you you presumably or the T is presumably not using the Nimbus functionality.  
**Mike Mgodeli:** Yeah. No,  
**Matthew:** Is that right?  
**Mike Mgodeli:** it's not it's not using the numbers commun not not the numbers  
**Matthew:** Okay.  
**Mike Mgodeli:** communications.  
**Matthew:** And I assume there's some some level of similar um offering in Zoho as well which you're obviously not  
   
 

### 00:18:21 {#00:18:21}

   
**Mike Mgodeli:** Yes. So on Zo we use Zo to actually look at the com the communication chain  
**Matthew:** using.  
**Mike Mgodeli:** and and trail. So you can actually see all the coms that have taken place regarding a case, right? As long as a person replies to the same subject line, let's say line is X,  
**Matthew:** Yes.  
**Mike Mgodeli:** we'll see the full trail, who said what, when, um, and you can just continue from there.  
**Matthew:** So you so you have that workflow then in Zoho.  
**Mike Mgodeli:** Yes.  
**Matthew:** Okay. So I I think we we just need to obviously probably not want to duplicate workflows, right? Have it here and in Zoho. I mean use one place for centralized communication.  
**Mike Mgodeli:** Yes. So ultimately look in my in my head what we're trying to solve for here is that once we go live on this right yes we're going to we'll probably at the end of this have some tweaks make some adjustments but once we go live we will we won't work on Zoho from a claims point of view all claims will be handled in the system or in in one place.  
   
 

### 00:19:20 {#00:19:20}

   
**Mike Mgodeli:** I don't want multiple touch points for the  
**Matthew:** Okay, got it. So it it's using this.  
**Mike Mgodeli:** agents.  
**Matthew:** So this system is completely replacing Zoho and therefore you you want to understand this communications panel over here can completely replicate what you're doing on Zoho at the moment in terms of a full communication auditor. Okay, got it.  
**Mike Mgodeli:** Send  
**Matthew:** Okay. Is is that clear to to you afraid and Ruben?  
**Reuben John:** Fred, is it is it are you happy with that? Is it technically  
**Frederic Brunner:** Yes, it's technically possible.  
**Reuben John:** possible?  
**Frederic Brunner:** It's just um I I am not sure about the surface of all the requirements that are being handled by Zo in terms of  
**Vassen Moodley:** That's cool.  
**Frederic Brunner:** customer followup. And my thinking was that our system would be handling outbound communications but not necessarily being the system where where we manage inbound communication. We don't want to be building a new uh uh uh mailbox if you like if you if you can if we can if we can avoid avoid doing that because that creates a lot of complexity that is completely different from a claims management system and a workflow management system.  
   
 

### 00:20:40

   
**Frederic Brunner:** So my thinking was to be working primarily on you uh detecting the tri trigger points and sending emails out. This is fine. Now the inbound communications we can think about how we handle them. We can surface them and have visibility over them. But I I would need to understand ex when you say when you say we want the the new system to completely replace Zoho I would need to understand precisely what you're doing currently in Zo to really understand the scope because there might be some functionalities uh that you're doing in Zo that might be difficult to replicate. So I don't want to to overcommit right now to something that I don't fully understand.  
**Mike Mgodeli:** Perfect. Let me just maybe show you an example of how it would work. Right? So,  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** for instance, can you see my screen? All right. So, we've got a So,  
**Frederic Brunner:** Yep.  
**Mike Mgodeli:** let me just take a glass claim that's come in. So, there's a glass claim that came in a day ago.  
   
 

### 00:21:49 {#00:21:49}

   
**Mike Mgodeli:** Uh, sorry. Is the glass claim. So, I've got trail of this glass claim. Sorry. Came in on the 9th of April at 11:18.  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** And this was the form and whatever was submitted on that last cla right we all consume this. This is the inro. All right.  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** Now the guys the consultant says at 11:52 on the same day I this is just a testing please ignore this. All right it's still testing. Please ignore this. So now this is closed. There's nothing more to do on this. Right. Whereas if they'd sent this in, I would not have tried to off what's happened with this claim. I'd only know that the claim is either closed or submitted. So when someone calls me, let's say from from Hike and say, "But guys, you still got a claim open here, I can I can reference this and say, but my consultant replied to you at 11 at 11:32 to say this was testing and this is closed. So what's the story?" And if it's if I'm only seeing outbound,  
   
 

### 00:22:58

   
**Mike Mgodeli:** I'd only see what is sent and not the coms between the two. So that's what I'm I'm trying to to to to solve to have the full completeness of of the system because again, I don't want a portion of the the claim to be to be run here. I can't measure that because we're going to measure this to someone you're out of SLA.  
**Frederic Brunner:** there  
**Mike Mgodeli:** They're going to say, "No,  
**Frederic Brunner:** there.  
**Mike Mgodeli:** but I've sent the email to this person and we can't track that." So you lose the full trail of that claim. That's what I'm trying to solve for or  
**Frederic Brunner:** Okay. No, no, I see I see um I see the value in having the full  
**Mike Mgodeli:** explain.  
**Frederic Brunner:** trail of the emails in the system. Um, but are there other use cases where you communicate with customers or brokers through or is it only a per claims  
**Mike Mgodeli:** That's purely it's purely for it's purely going to be for claims.  
**Frederic Brunner:** channel?  
**Mike Mgodeli:** So we've got internal coms on however we'll speak to internally.  
   
 

### 00:24:04 {#00:24:04}

   
**Mike Mgodeli:** But from a claims point of view I I need to have the trail and audit of the claim.  
**Frederic Brunner:** Okay, that makes sense. So that's that that that that's interesting and um the the the claims in intake would just come also through Zo. So basically what's what the idea is the customer sends an email uh with the form it gets created on Zo and then since our systems integrated with Zo we get the data from Zo we get the claims uh intake from there. Is that what you what you're thinking?  
**Mike Mgodeli:** So, so look on our side is we can push the data to you in various ways, right? We'll be one either create your form that will be embedded on our  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** system to to push to effectively create your to create the  
**Vassen Moodley:** It's just  
**Mike Mgodeli:** the claim directly. We also currently getting a claim form from our into our  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** mailbox. So a WhatsApp bot that captures the whole claims journey.  
**Frederic Brunner:** Mhm. Mhm.  
   
 

### 00:25:10

   
**Mike Mgodeli:** So as an example to show you uh where's my screen now got so many screens open. So this claim can you see my so this has come through our WhatsApp bot  
**Vassen Moodley:** Stop.  
**Frederic Brunner:** Yep.  
**Mike Mgodeli:** right this is the full claims details of that claim. So we verified this person via the registration number the policy is active. This is the vehicle information. There's the damages of the car. There's the picture of the damage of the glass that's broken. So from a client point of view, they've effectively they've effectively started the glass slab, right?  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** This will go into this will go from here. Uh so So this will land in Suzoa here. Let me just find the rich. Sorry. So this will be the class claim details that will be sent through to I'm assuming this is the same claim sorry that will be sent through to through to the team to start the claims process.  
**Reuben John:** just out of interest. Are you are you looking to replace Zoho entirely  
   
 

### 00:27:08 {#00:27:08}

   
**Mike Mgodeli:** Yes. So if I've got if I've got the claims flow running,  
**Reuben John:** then?  
**Mike Mgodeli:** I want to replace the Zoa process entirely from a claims management point of view. Does it make sense?  
**Frederic Brunner:** Yeah.  
**Reuben John:** Yeah.  
**Frederic Brunner:** No, that makes sense.  
**Mike Mgodeli:** Because here what it's managing for me is the claim journey,  
**Frederic Brunner:** Yeah.  
**Mike Mgodeli:** right?  
**Frederic Brunner:** Okay. All  
**Mike Mgodeli:** And of the claims journey. So that's what I'm trying to solve for.  
**Frederic Brunner:** right.  
**Mike Mgodeli:** Yes, it's got other things that we don't necessarily need. I'm not trying to recreate Zo here,  
**Frederic Brunner:** Okay.  
**Mike Mgodeli:** but I'm trying to optimize how a claim starts from the beginning to the end and what will make it as easy as possible for the users to to manage.  
**Frederic Brunner:** Right. And so your mailbox,  
**Mike Mgodeli:** Yeah.  
**Frederic Brunner:** you're using Google. So all of your agents actually use Google as primary mailbox.  
**Mike Mgodeli:** Yeah.  
**Frederic Brunner:** Zo is just uh uh replicating the stuff that's in that's in that's in Google.  
   
 

### 00:28:00 {#00:28:00}

   
**Frederic Brunner:** Okay. All right.  
**Mike Mgodeli:** Yes.  
**Frederic Brunner:** But it provides you the claims view of what's on the what's what's of what's in Google basically. Okay.  
**Mike Mgodeli:** Yeah.  
**Frederic Brunner:** And so  
**Mike Mgodeli:** Because in in Google is why you go away from a mailbox.  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** I'll send a mail to to Reuben to help me with a claim, but Reuben is on leave, right? Doesn't act on it for two weeks. that claim hasn't been worked for two weeks.  
**Frederic Brunner:** Yeah. Yeah. Yeah. Okay. Okay.  
**Mike Mgodeli:** So that's the premise of why it must be  
**Frederic Brunner:** Got you. Got you. And and so you said you mentioned that you've got like a WhatsApp boat to get the what's what's the  
**Mike Mgodeli:** centralized.  
**Frederic Brunner:** um what's the step before? Where do you get the where are the forms? Where where do the when the user actually fills in the form? Where does it where is the form deployed? And where does the form land when it's completed?  
   
 

### 00:28:51 {#00:28:51}

   
**Mike Mgodeli:** So the forms are the forms are on our website right. So hence why I saying if I take a the user comes to RT here these are just Zo hyperlink forms. So on my end, if we take your baseline of a claim form, we can just replace this for someone to to initiate the claim from the system from  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** here. That will land straight into true  
**Frederic Brunner:** Okay. All right. No, that that that that can work.  
**Mike Mgodeli:** A.  
**Frederic Brunner:** That can work. And then what's important to you is that we have a view of all the communications pertaining to the claim within within within  
**Mike Mgodeli:** Mhm.  
**Frederic Brunner:** TR regardless of who's had the conversation,  
**Mike Mgodeli:** Yeah.  
**Frederic Brunner:** regardless of which uh uh Google account it's coming from.  
**Mike Mgodeli:** And 100%. So it all will land effectively through like a claims email address um that  
**Frederic Brunner:** Okay.  
**Mike Mgodeli:** will that will um land over here that people can work on it  
**Frederic Brunner:** Okay. All right.  
   
 

### 00:30:08 {#00:30:08}

   
**Frederic Brunner:** I understand the requirements. I think we we can we can socialize  
**Mike Mgodeli:** but we can but we can proceed on we can proceed with the demo.  
**Frederic Brunner:** that.  
**Mike Mgodeli:** Sorry on that but I just  
**Frederic Brunner:** Yeah. No, no, no, no. But look,  
**Mike Mgodeli:** thought  
**Frederic Brunner:** Mike, it's very important that we have a common understanding of this point. So, by all means, I think it was very very useful. I wanted to talk about claims in tech. That's very now that you want to replace Z. That makes perfect sense. I see the see the value for you and we can definitely do that. Um, all right.  
**Reuben John:** And just before we continue,  
**Frederic Brunner:** So,  
**Reuben John:** I see Vasan's been patiently waiting with his hand up as  
**Frederic Brunner:** oh,  
**Mike Mgodeli:** Yeah.  
**Frederic Brunner:** Professor Yeah.  
**Vassen Moodley:** Just a question from my side.  
**Reuben John:** well.  
**Vassen Moodley:** Uh now that we've notified the assessor, now there's certain documentation that the assessor requires.  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** Uh there's the notification plus the supporting documents.  
   
 

### 00:30:57

   
**Mike Mgodeli:** Okay.  
**Vassen Moodley:** Uh is this catering for that supporting documents as well?  
**Frederic Brunner:** So where do so you say the assessors need to have some documents? How do they get these documents today?  
**Vassen Moodley:** via  
**Frederic Brunner:** All right.  
**Vassen Moodley:** email.  
**Frederic Brunner:** So your agent just uh takes the documents from the form. It says do they came come from the form? How do they do they get the input  
**Vassen Moodley:** So let's say it could be claim form, it could be photographs, it could be uh certain reports that need to be sent.  
**Frederic Brunner:** document?  
**Vassen Moodley:** So there's a there's a suite of reports that one would send to the assessor. So uh if  
**Reuben John:** But where do where do they live? Where do they live?  
**Vassen Moodley:** we  
**Reuben John:** Do you put them in a folder on your system? Where do you store  
**Vassen Moodley:** on rock  
**Reuben John:** them?  
**Vassen Moodley:** actually rock being the claim  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** system  
**Frederic Brunner:** So these documents they have to be sent by the policy holder basically along by the consultant.  
   
 

### 00:32:02 {#00:32:02}

   
**Vassen Moodley:** by the consultant  
**Frederic Brunner:** Okay. Along with the the form and then you go and store them on rock. That's part of the claim submission process. And then when you when you when you do the uh assessment the  
**Vassen Moodley:** Yes.  
**Frederic Brunner:** um uh assessment appointment you have to send them a a list list of documents. You say that these list of document depends on several things. You said that it depends it's not always the same list of documents.  
**Vassen Moodley:** uh let's say a glass claim will be a set of documents.  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** Uh an accident claim will be uh if it's a write off there's a slightly different set of documents but we can share that with you.  
**Frederic Brunner:** And what happens if you don't have all the  
**Vassen Moodley:** Now that's where one of the challenges is. So here's a claim being registered.  
**Frederic Brunner:** documents?  
**Vassen Moodley:** We go through the process and the process is halted uh because certain documentation is not available. Uh we currently bypass that documentation phase and allow the assessment to take place but then wait for this documentation to proceed further with uh authorizations and so forth.  
   
 

### 00:33:20 {#00:33:20}

   
**Vassen Moodley:** So what Mike is talking about having the centralized view and having uh you know a single repository for that information it helps us track ensure that the documentation that's outstanding is also managed and within an SLA and the communication both to and from is handled in the same place.  
**Frederic Brunner:** All right. But when it's time to uh uh call for an assessment and you realize that you're missing a document, then you contact back the policy holder saying, "Hey, you we're missing we have a missing document there." And you wait for them to to respond, right? And  
**Vassen Moodley:** Now the certain certain instances will allow the assessment to continue whilst we  
**Frederic Brunner:** yeah,  
**Vassen Moodley:** wait for those documents.  
**Frederic Brunner:** yeah. Yeah. Yes. But then the payment of the claim will be subject to the policy  
**Vassen Moodley:** providing those documents.  
**Frederic Brunner:** holder submitting the documents. Well, and and while you're okay.  
**Vassen Moodley:** Yes.  
**Frederic Brunner:** All right. But what while while you are expecting for these documents the SLAs keep running  
   
 

### 00:34:25

   
**Mike Mgodeli:** center.  
**Vassen Moodley:** Look, let's say uh there are the how we'd handle it in certain instances.  
**Frederic Brunner:** normally  
**Vassen Moodley:** So let's say in the assessment uh phase itself um let's say uh one of the prerequisites is the path sourcing element and let's say if there's certain items or there's certain  
**Frederic Brunner:** in  
**Vassen Moodley:** information that's not available then there's a pause. So we want to create a pause in that process to say uh this mustn't let's say if there's uh a dependency uh it doesn't  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** influence uh you know the SLA period itself. So pause get the document continue from there so that they within SLA if I if I'm making sense.  
**Frederic Brunner:** Yeah, that's the way you're dealing with it right now, right?  
**Vassen Moodley:** Yes.  
**Frederic Brunner:** You're just causing the SLA to to get to  
**Vassen Moodley:** Yes.  
**Frederic Brunner:** um allow for more time to get the get documents. But wouldn't it be easier to just um have a gate and tell  
**Vassen Moodley:** Yeah.  
**Frederic Brunner:** the policy holder, we're not processing proceeding with your assessment until you give me all the list of documents.  
   
 

### 00:35:50

   
**Frederic Brunner:** I'm I'm just suggesting um suggesting changes. I'm not saying this is the right way to do it, but just why aren't you doing it this way? Is there any reason?  
**Mike Mgodeli:** Yeah.  
**Frederic Brunner:** Do you?  
**Mike Mgodeli:** So there's so maybe let me jump in on that. Right. So operationally is you want to the the the trigger to stop  
**Frederic Brunner:** Yeah.  
**Mike Mgodeli:** the the payment we need to have all the documents done. So what we do is we would have verified the accident right that it is indeed a valid  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** accident. We would have received the quotation and quantified the damage.  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** The assessor the assessor's function is to actually say guys based on this description of loss I drove into a hopey there's no dog lovers. I hit a dog. Boom.  
**Vassen Moodley:** Okay.  
**Mike Mgodeli:** Now in the front your damage is on the front. The assessor is going to get the quotations. He's going to say cool. I'm happy with all this front damage.  
   
 

### 00:36:42 {#00:36:42}

   
**Mike Mgodeli:** It's aligned to this. I'm rejecting the back damage. This is not related to this claim. We're happy to proceed on this job at 10,000 rand. Cool. We then go and we say we're happy to proceed. The car goes to the repairer. The repairer can get the the the the authorization. We're not declining the claim. We're not saying you're not proceeding with your claim. However, we're never going to settle the claim until all the documentation is done is received and also that the post repairs um the post repairs proof is completed then we can release the payments. But we haven't stopped the claim cycle from taking from kicking off. What happened in the past is that I'm going to wait 3  
**Frederic Brunner:** What?  
**Mike Mgodeli:** days to to appoint the assessor because I'm waiting for the driver's license. Right. Then I receive the driver's license. 3 days later, I start the assessment process. That takes me two days. Okay.  
   
 

### 00:37:42

   
**Mike Mgodeli:** Then I'm waiting for one more document. I've already got the assessor's report. I can't give the go ahead for the repairs to start. Maybe that takes me another week. So, I've lost 10 days on the repair cycle on getting that car back on the road because of a driver's license that was missing, which is which was not which is not really material to the claim.  
**Frederic Brunner:** I  
**Mike Mgodeli:** it's just a a procedural part. So that's how we try hard and try and optimize the flow. So my thinking around this is let's perhaps proceed with what you've got here. Okay. I foresee as effectively as a sub process underneath it.  
**Frederic Brunner:** Okay. No,  
**Mike Mgodeli:** Does it make sense?  
**Frederic Brunner:** this is this is it is very clear and that's what I wanted to hear like is why did you want to carry on with the uh with the assessment even if you're missing a document since it's going to it's just because you want to make sure that the process uh is accelerated and you don't block like a potentially valid claim just because there's a missing document that's not material to the claim.  
   
 

### 00:38:45 {#00:38:45}

   
**Frederic Brunner:** All right,  
**Vassen Moodley:** Great.  
**Frederic Brunner:** that makes sense.  
**Vassen Moodley:** Also, also please bear in mind these are functional vehicles.  
**Mike Mgodeli:** Yeah.  
**Vassen Moodley:** the quicker those vehicles are repaired and on the road uh it's it's revenue uh you know to the the the the driver itself to the policy holder and uh to RTU itself. So it is in our interest to make sure that the vehicles get out as quick as possible.  
**Reuben John:** Just a question. Are you expecting those documents to live in our system as well, the supporting documents or because it sounds like at the moment they live on rock that maybe they live also in folders on your system. just trying to understand because you mentioned let's say we appoint an assessor now and we automate the email for you but it doesn't have the attachments doesn't have the documents so I'm trying to  
**Vassen Moodley:** right?  
**Reuben John:** understand are you looking to manually append those do you want those to live on our system and you can attach them what would be ideal for you I can't promise what we'll do but I'm just trying to understand your requirement  
   
 

### 00:39:47 {#00:39:47}

   
**Mike Mgodeli:** Yeah. So ideally what you want to do on our end is have record of that on the system and that that's where we'll be sending it out from and then obviously we'd upload that on rock.  
**Vassen Moodley:** that  
**Mike Mgodeli:** So, should should we come here a year later and look after claim SPM543? We can go in and say, "Cool. Documents. What documents do we have?  
**Vassen Moodley:** heat.  
**Mike Mgodeli:** I've got the the the claim form. I've got the pictures. I've got the assessor's report. I've got the final amount. Okay, there's the full claim. It's done." Is that a city that you're adding onto the system  
**Reuben John:** Okay,  
**Mike Mgodeli:** or not? Really?  
**Frederic Brunner:** Okay.  
**Reuben John:** I think we we think about it the way I'm thinking about this working and again we still need to discuss this but a system that you need to tell us which documents are required for every different type of claim as a prerequisite overall as well as what needs to go to the assessor  
   
 

### 00:40:47 {#00:40:47}

   
**Mike Mgodeli:** Perfect.  
**Reuben John:** and you once they're uploaded you can either verify that they're there or we'll tell you there's  
**Mike Mgodeli:** Oops.  
**Reuben John:** a document that looks like an image or a driver's license and we tell you it's there with a manual override option for you to say proceed with the claim even though documents are missing. So you must choose to proceed with the claim.  
**Mike Mgodeli:** So,  
**Vassen Moodley:** So,  
**Mike Mgodeli:** so maybe if I can share my screen again,  
**Reuben John:** Um  
**Mike Mgodeli:** what we have on our side,  
**Vassen Moodley:** something  
**Mike Mgodeli:** right, just the documents you would receive when a claim is registered. when someone notifies of us of a claim. So I'm I'm using this as a an example currently the people would  
**Vassen Moodley:** Excellent.  
**Mike Mgodeli:** submit these these documents when they said when they're registering the claim. There's the info, there's the quotations. I've made these um I've made these documents obviously on this side as  
**Reuben John:** Yeah.  
**Mike Mgodeli:** your mandatory but we can play around on what's what's mandatory or not.  
   
 

### 00:41:44 {#00:41:44}

   
**Mike Mgodeli:** So, as soon as you receive the claim, you'll receive all of this information that we've got here and the supporting documents linked to it. In the same vein that you get a class claim like this, there's all the information you've got and you've got the picture of that car as a start, right?  
**Frederic Brunner:** H.  
**Mike Mgodeli:** So, so my view is that we we should keep track of it on the system.  
**Reuben John:** Okay.  
**Mike Mgodeli:** So, we've got continuity on it.  
**Frederic Brunner:** Yeah. Okay, that makes sense. Look, it was something that you can see in in our demo, we have a tab specifically meant for you to work with documents. So, we we're prepared to work to work with your documents.  
**Mike Mgodeli:** Mhm.  
**Frederic Brunner:** Um, I think it makes sense so that you have like a unified view of uh of the claim and the documents are important. That's that's something that we can we can we can work with. No problem.  
**Mike Mgodeli:** This is  
**Frederic Brunner:** Let's I'll carry on with the demo.  
**Mike Mgodeli:** great.  
   
 

### 00:42:44 {#00:42:44}

   
**Frederic Brunner:** So basically here we are thinking okay now we have received the assessment whether we do that automatically or let's let's just just assume that for some of these documents it's a little bit manual. You just upload the uh uh assessment that you've received and then it's going to uh populate the assessed amount and what we can do also from here is look at your radics part benchmark data and based on what's being repaired in the assessment we can have a look at what the assessor is saying versus what radics is recommended and you can look have a look at the variance. So here Luke Ruben pointed out to me that it should be plus five 20 and 20 rands rather than minus. But the idea here is you could see the difference between like for a given part was the difference between what the assessor is uh pricing versus what the radics benchmark is saying rather than doing it automat you could we could do this automatically for you. Yes, mate.  
**Mike Mgodeli:** Sorry, another question. Um, this part this part that you you're looking at at the moment, is this based on the assessor's report that's uploaded or is  
   
 

### 00:44:07 {#00:44:07}

   
**Frederic Brunner:** Yes, that that that that would be the idea.  
**Mike Mgodeli:** it  
**Frederic Brunner:** We you would you would upload the assessment assessment report. Then we would check out the parts from there versus what's we've got on radics and is there's a meaningful benchmark for that particular part. We could we could we could highlight the uh the var the potential  
**Mike Mgodeli:** Yeah.  
**Frederic Brunner:** variance.  
**Mike Mgodeli:** So then just to confirm you you you essentially then would scrape the assessor's report uploaded and break down the components of the claim as this as per the below. Correct.  
**Frederic Brunner:** Absolutely. That's what we're doing for another another for a warranty provider in Switzerland.  
**Mike Mgodeli:** Great. I'm just thinking out loud right from an assessor. Now I've appointed Reuben as the assessor. Would it not make sense to actually control what Reuben gets? So why I'm saying what control what Reuben gets? We've already captured a claim form on the system, right? we've already got um the the quotations or whatever information on the s  
   
 

### 00:45:09 {#00:45:09}

   
**Frederic Brunner:** H.  
**Mike Mgodeli:** on on the system here. So when I'm I'm appointing Reuben,  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** if I send a mail to Reuben with a hyperlink that will open up just for this particular claim number SPM5 for whatever, Reuben will upload the assessor's report, capture whatever info he needs to capture and then submit that. Then it will come back into your world. Is that how we would operate in other spaces or how was your thinking around that?  
**Vassen Moodley:** Okay.  
**Frederic Brunner:** Um, we weren't thinking about building a particular UI for the assessors. How's it done today? The the assessors they they send send back an email, right, with the assessment.  
**Mike Mgodeli:** Yeah,  
**Frederic Brunner:** Well,  
**Mike Mgodeli:** it's all Yeah,  
**Frederic Brunner:** that's what I was assuming.  
**Mike Mgodeli:** it's all emails at the moment. But in the same way, the email is not the email is not really trapped, right? So, I'll get an email. It will go out and we'll we'll have to wait and the guy will say, "Look, I haven't received the email." But if we've already got it part of this process here,  
   
 

### 00:46:16

   
**Mike Mgodeli:** when I'm sending out the the the mail, when I'm appointing that assessor or sending them the mail, I can already effectively send him something which ties into this particular claim.  
**Frederic Brunner:** Okay.  
**Reuben John:** So, a link basically that they could use to submit directly back into the system as opposed to an email.  
**Frederic Brunner:** So,  
**Reuben John:** That's what you're saying.  
**Mike Mgodeli:** 100%  
**Frederic Brunner:** yeah, that's that's that's doable.  
**Vassen Moodley:** Yeah.  
**Mike Mgodeli:** chance.  
**Reuben John:** Okay.  
**Frederic Brunner:** So as part of this email, this draft communication, uh we could we could definitely also send uh send the link that will allow the assessor to  
**Mike Mgodeli:** Okay,  
**Frederic Brunner:** upload the document directly so that you don't have to do it. That that makes sense.  
**Mike Mgodeli:** perfect.  
**Frederic Brunner:** That does make sense.  
**Mike Mgodeli:** Cool. Thanks,  
**Frederic Brunner:** Um, and then once the assessment's been received, then your agent just has to go, all right, we've received the assessment, we're going to carry on with the next step. So maybe that step could be done automatically. Then internal approval.  
   
 

### 00:47:20 {#00:47:20}

   
**Frederic Brunner:** So is it is it within within excess? No. So we're just going to run this approval six. So this approval step I think maybe happens in rock. I think the insurer has to approve it some something like that maybe uh I missed something but then so then you ask for approval we just confirm approval from the insurer. All right. Then next step is the generation of the uh document where I generate the document and then I understand there's a fork. We can just go for a repair or total loss. In this case, let's just go and select that it's going to be a repair. And then there's inspection and costing. So there's the actual repair quotes which might different from the assessor quotes.  
**Mike Mgodeli:** All Five.  
**Frederic Brunner:** Yeah. Okay. So, I'll Well, we So, this could actually be a similar process. The repair could actually upload their quotes, but it could also be an um a link. And then original assessment. This is the final final cost.  
   
 

### 00:48:36 {#00:48:36}

   
**Frederic Brunner:** We're just going to go and confirm the final cost and start the repair. All right. Once the repair is confirmed complete by the repairer, we just mark it as complete and the claim is closed where we've sent an email to the client that the repair has started that the claim when and here the claim is closed. And you can see here you got the to full audit logs of all the events that happened on the claim that you can export. And that's the end of the process for that particular for that particular claim. That's it. Mike, I'm going to pause here. Do you have questions, feedback? Um  
**Vassen Moodley:** couple of questions now.  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** Um let's say uh we need you mentioned about getting the insurer approval.  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** Absolutely right.  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** So we've got a mandate for motor up to 50,000 rents. So within 50,000 we automatically give that approval above 50,000  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** the insurer uh needs to provide that improve approval happy with that when we start the repair process uh you know that SLA management throughout the the life cycle will be maintained and you showed me the initi you know the first screen uh when we  
   
 

### 00:50:12 {#00:50:12}

   
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** finalize the claim and ready for settlement.  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** Uh we call it an F FRC process. That means the final set of documents uh you know with post repair  
**Frederic Brunner:** Yep.  
**Vassen Moodley:** photographs uh the final invoice the uh what they call this uh the release forms. There's a set a suite of reports that need to come back uh between the repairer and uh the assessor.  
**Frederic Brunner:** Mhm.  
**Vassen Moodley:** So repairer does the final the assessor reviews and together those documents are sent to us and that what forms the basis for settlement of that claim. So that part I'm a little bit fuzzy about. Uh, have you've covered  
**Frederic Brunner:** um no I wasn't I wasn't aware that there was this settlement  
**Vassen Moodley:** that?  
**Frederic Brunner:** uh step I don't think that was documented uh in what we what we the the stuff that we had but this is something that we can definitely take into accounts based on your uh based on your feedback,  
**Vassen Moodley:** Mike, before you  
**Mike Mgodeli:** Yeah. So thanks for that guys.  
   
 

### 00:51:27

   
**Mike Mgodeli:** So so again I think what uh the flow is very simplistic from from from end to  
**Frederic Brunner:** Mike.  
**Mike Mgodeli:** end. Um if I maybe can request if you can just give get give access so we can just play around with it. My thinking around those sub process is vast. It's similar to this assessment process what we asking the repairers to do. So I don't want to at times we over complicate what we're trying  
**Vassen Moodley:** Mhm.  
**Mike Mgodeli:** to solve for but from a from a pointto-point point of view I'm I'm comfortable in how it's flowing. It looks very intuitive and simple. um we can then build out the subprocesses like the like I was mentioning on assessment if I appoint an assessor I'm going to send him a hyperlink and he'll manage that particular claim on that view and I think you can do the same effective function when it comes to the repairer as well but those would be effectively like your subprocesses that take place but fundamentally  
**Matthew:** Hey,  
**Mike Mgodeli:** high level I think this is the life cycle of a natural claim  
   
 

### 00:52:31

   
**Vassen Moodley:** Except for settlement,  
**Matthew:** that's it.  
**Mike Mgodeli:** Yes.  
**Vassen Moodley:** right?  
**Mike Mgodeli:** So the the settlement the settlement will happen post the repairs. Um the member settlement will take place on on rock.  
**Vassen Moodley:** Yeah.  
**Mike Mgodeli:** the system here will the user will come here and say look I've closed the claim it's complete it's settled or alternatively we can actually close it on the back end from the from the from the claims from the reports that you get from Niss or rock that the claim is finalized so the the agent doesn't technically close the claim the system closes the claim but we can enhance those things but I think from a a version one I think this is a good  
**Frederic Brunner:** Okay. Well, that's good to hear. I we still have eight more minutes, so I don't think we're going to I'll be able to show you the full uh theft claim process, which is a little bit more complex, but you get the idea. This is the same we've modeled your operating system operating um workflow uh in the same in the same way.  
   
 

### 00:53:36 {#00:53:36}

   
**Frederic Brunner:** And I've got the glass claims which is also like a bit more a bit more simple and which is a little bit more automatic. If I confirm it, I go for a policy number. I put like an excess, right? I confirm. Here is a claim number. Confirm the registration. I appoint a repairer. We confirm the appointment. And when this is complete, claim is closed. It's very straightforward process for glass claims which is most of your claims. And so another thing I need to show you before uh we go is the dashboard. So on the dashboard you will be able to see the claim volume per day, the different type of claims, the average uh days to close, the settlement amount, compliance rates, workloads for the assesses and the live status on the SLAs,  
**Matthew:** This is very useful.  
**Frederic Brunner:** right?  
**Matthew:** This is something that we obviously we building manually offline now. So this is very useful especially the top sort of summary you know on the  
   
 

### 00:54:53

   
**Vassen Moodley:** Agreed.  
**Reuben John:** If you if you've got additional stuff you want to add to it, again, we'll let you play around with all of this,  
**Matthew:** title  
**Reuben John:** but let us know and then we can build it directly custom to the metrics that you want. One other thing, you can also change the UI on this, by the way. We can offer you up to whatever 20, 30 different themes, colors, whatever you want. But Fred will show you you can change it to um a bunch of different uh things to suit your workflow. If you've got a color in mind, let us know, whatever the case might be, and you can simply change everything. We only have I see Mike's got a question,  
**Mike Mgodeli:** Cool.  
**Reuben John:** but I want to just summarize final or next steps rather. Mike, what's your what's your point? And then we'll go from there.  
**Mike Mgodeli:** Look, I know we're out of time. I wanted to actually check on the, you know, on an actual individual claim, the time the effectively like a the timeline from a for a claim.  
   
 

### 00:55:45 {#00:55:45}

   
**Mike Mgodeli:** I know you or I know that progress bar gives us each interactions but if I've got a claim to say guys this claim had 10 interactions each point of these interactions took so so long this is how long the claim start took from start to finish that would be quite useful but I can add to that on a notes point of  
**Reuben John:** Yeah, touch points per claim.  
**Matthew:** Excellent.  
**Reuben John:** Easy easy to add.  
**Frederic Brunner:** Yeah, no  
**Matthew:** And one one last thing, sorry. On the dashboard,  
**Reuben John:** Um  
**Frederic Brunner:** problem.  
**Matthew:** uh I assume those are downloadable in can you download these sort of uh into a sort of report or can you only view them here?  
**Frederic Brunner:** No, they can. We can we can create we can build an export feature.  
**Mike Mgodeli:** Hey,  
**Frederic Brunner:** It's just another another requirement. But we we can build an export feature and if that that suits you  
**Matthew:** Yeah,  
**Reuben John:** This  
**Matthew:** it may not be really necessary on day one,  
**Mike Mgodeli:** heat.  
**Matthew:** but I think in time it could be.  
   
 

### 00:56:36

   
**Reuben John:** is  
**Frederic Brunner:** much.  
**Matthew:** Um, you know, there's going to be weekly meetings to review sort of claims progression,  
**Vassen Moodley:** soon.  
**Matthew:** especially claims type and how that's evolving, claims volume and so on.  
**Reuben John:** what you  
**Matthew:** So to be able to present it as part of a deck in that uh in those review meetings would be helpful.  
**Reuben John:** Yeah,  
**Frederic Brunner:** Sure.  
**Reuben John:** this is based on your data by the way.  
**Vassen Moodley:** That's  
**Reuben John:** So we've actually modeled your your actual data here. You can also change it for week, for month, for year. You can make this quarterly for example. It all changes dynamically and then you would export the reports dynamically based on that. So to just take away all reporting function from you guys, just tell us what you need. Um, final thing just to wrap up. I'm cognizant we have four minutes left. Okay. In terms of next steps, we is there any outstanding data, Fred, or documentation or anything that we still need in order to move this forward?  
   
 

### 00:57:29 {#00:57:29}

   
**Reuben John:** And then how would you like the process to proceed with with finishing the tool and then giving it for testing?  
**Frederic Brunner:** Um well I think we need a followup session to discuss in more details the communication plan how we structure the triggers and the communication metrics. Um I think we need to um well I think would be okay to uh release the demo uh in the in a few days that it's currently sitting only on my on my laptop but we could we could provide provide you with the demos for you to play with and give give us some some feedback. I think that could also be be useful. Um maybe an understanding of what you're doing precisely in rock could also be useful and to see what's the uh integration uh capabilities of rock would be interesting. I'm still assuming that we're not looking to do any integration with Nimbus but maybe with rock that could be useful. I don't know what what were your all thinking was but on this  
**Mike Mgodeli:** Cool.  
**Frederic Brunner:** but  
**Mike Mgodeli:** Maybe I jump on it.  
   
 

### 00:58:53 {#00:58:53}

   
**Mike Mgodeli:** So just what my thinking on my end,  
**Vassen Moodley:** Thanks.  
**Mike Mgodeli:** right? I'm thinking what we do is the the simplest part with this and how quickly we're going to establish what's needed. We start off with a glass claim right on the flow. We start off with a glass claim.  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** we effectively create a tune sandbox on your side for us. We'll give we you must then help us with your with a  
**Frederic Brunner:** Mhm.  
**Mike Mgodeli:** form that we can use that will land into the into your system. Making sense? So instead of someone capturing a zoa glass claim, we can actually put in a a true aim glass cla. That's the one one one thing I'd say we should add. The second part that I would then suggest is I'm already getting blast claims through my WhatsApp by onto my email. How do I forward those or get them into your system?  
**Reuben John:** Maybe a link on the WhatsApp channel saying redirecting to the true AIM form and then fill out the form instead which ends up here anyway.  
   
 

### 00:59:59 {#00:59:59}

   
**Mike Mgodeli:** Yeah. So, so the the data is here. So, what my what the guys are doing on the back end, they're scraping this data. If I can scrape it and send straight through to you guys with the supporting docks, you can effectively proceed. So if you've got the the S the the base the bench line of the glass claim, we can use that as a starting  
**Frederic Brunner:** Okay, we can uh we can definitely build that.  
**Mike Mgodeli:** point.  
**Frederic Brunner:** So it would be it's it's a very good idea to start with the simplest use case and build from there.  
**Mike Mgodeli:** Yeah. And then and yeah. And then what I'll probably need what we'll need for us on our side is who are the actors in this  
**Frederic Brunner:** So,  
**Mike Mgodeli:** part in this in the claim for our end. So for instance the assessor details who's the assessor when we going and you go on to appoint the assessor who rocks up one there. So you guys must perhaps give us what information you need so we can get that for um prepared for you.  
   
 

### 01:00:58 {#01:00:58}

   
**Vassen Moodley:** Yeah, for  
**Reuben John:** Okay, we'll discuss internally.  
**Vassen Moodley:** sure.  
**Reuben John:** I know Fred's got a hard stop now. So, we'll discuss internally and send you an email summarizing all the things we need from you based on this on this  
**Frederic Brunner:** No.  
**Reuben John:** discussion and the plan going forward. All right.  
**Vassen Moodley:** Right.  
**Reuben John:** Okay. Great.  
**Vassen Moodley:** Uh one more thing just put some timelines when you want it by so that  
**Mike Mgodeli:** Perfect.  
**Vassen Moodley:** uh you know it's just so caught up in many things here. So if we have to deliver on certain time let us make sure we get it to  
**Reuben John:** Yeah, we'll prioritize it.  
**Vassen Moodley:** you.  
**Reuben John:** We'll give you a list on priorities.  
**Vassen Moodley:** Fantastic.  
**Mike Mgodeli:** Hang  
**Reuben John:** Okay,  
**Vassen Moodley:** Great.  
**Reuben John:** thank  
**Vassen Moodley:** Great job guys.  
**Frederic Brunner:** Thank you very much.  
**Reuben John:** you.  
**Matthew:** Good weekend. Speak soon.  
**Alin Koppandi:** Thank you.  
**Frederic Brunner:** Bye-bye, guys.  
**Vassen Moodley:** Cheers everyone.  
**Alin Koppandi:** Bye-bye.  
**Reuben John:** Byebye.  
**Vassen Moodley:** Sure.  
**Mike Mgodeli:** on for a sec when you're done. That jumped off.  
**Vassen Moodley:** Right. Everyone's  
**Mike Mgodeli:** No, but I think that's jumped off. Let's see if I got  
**Vassen Moodley:** off What?  
   
 

### Transcription ended after 01:03:47

*This editable transcript was computer generated and might contain errors. People can also change the text after it was created.*