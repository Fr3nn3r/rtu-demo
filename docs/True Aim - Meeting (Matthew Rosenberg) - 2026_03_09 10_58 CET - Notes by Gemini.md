# 📝 Notes

Mar 9, 2026

## True Aim \- Meeting (Matthew Rosenberg)

Invited [Reuben John](mailto:rjohn@trueaim.ai) [matthew.rosenberg@4gh.co.za](mailto:matthew.rosenberg@4gh.co.za) [vassen@rtusa.co.za](mailto:vassen@rtusa.co.za) [Steve Cory](mailto:steve@oaksure.co.za) [mike@rtusa.co.za](mailto:mike@rtusa.co.za) [fbrunner@trueaim.ai](mailto:fbrunner@trueaim.ai)

Attachments [True Aim - Meeting (Matthew Rosenberg)](https://www.google.com/calendar/event?eid=NDlkZWlxZGkxYmQzdmgzMW52MW1ubHUyOG8gcmpvaG5AdHJ1ZWFpbS5haQ) 

Meeting records [Transcript](?tab=t.3xbqybnivsmr) 

### Summary

RTU overviewed current manual claims processes, receiving a solution proposal for automation and discussing aggressive implementation timelines.

**RTU Claims Process Overview**  
RTU, an underwriting manager for passenger transport, detailed its current systems, noting a manual claims process that requires data to be downloaded from Zoho and manually uploaded into the insurer administrator systems, Nimbus and Rock. The full claims management and decision-making are driven by the Rock system, while Zoho is used only for policyholder communication.

**Proposed Future State Automation**  
The proposed solution can automate claim ingestion and potentially populate data onto the existing platforms, reducing manual interaction. The core system provides claim data organization, contextual analysis against policy terms, and a recommended claim decision, including a new fraud intelligence layer.

**Implementation and Commercial Discussion**  
RTU processes between 80 and 100 claims monthly, with volume expected to increase, necessitating the rapid system implementation. Implementation will follow an aggressive 2 to 4-week sprint, leading to a pilot phase with commercial terms based on a value-based per-claim fee.

### Details

* **Introductions and Logistics**: The meeting began with introductions between Frederic Brunner, Vassen Moodley, Mike Mgodeli, and Reuben John, with Mike Mgodeli noting that they were joined by Venia, and Reuben John mentioning that Frederic Brunner's wife is South African ([00:00:00](#00:00:00)). Logistical issues were noted, including poor sound quality from Mike Mgodeli and Vassen Moodley's side, leading Vassen Moodley to relocate to a car to find a quieter spot. Matthew and Jonny Rosenberg joined the call as the discussion began ([00:03:17](#00:03:17)) ([00:05:37](#00:05:37)).

* **RTU Company Overview**: Mike Mgodeli provided a brief background on RTU, describing them as an underwriting manager focused on the passenger transport space, particularly e-hailing markets like Bolt and Uber in South Africa ([00:02:12](#00:02:12)). Their offering is provided to both individual owners and fleet clients, and they operate a small team of eight or nine people servicing over 200 brokers. Mike Mgodeli emphasized that their core offering is an efficient claims process, and they are interested in future-thinking solutions in this area ([00:03:17](#00:03:17)).

* **Current Systems Overview and Claim Flow**: Mike Mgodeli outlined RTU’s current operational systems, which include an internal Zoho system for managing ticketing, along with two insurer administrator systems called Nimbus and Rock ([00:07:45](#00:07:45)). Nimbus handles policy management, including where the risk lies and the initial First Notification of Loss (FNOL), which then triggers the process on Rock. Rock is where the entire claims management takes place, including assessor appointments, supplier flagging, payment settlements, and where all claims data resides ([00:08:40](#00:08:40)).

* **Manual Processes in Claims Management**: Mike Mgodeli clarified that while the full claims registration and supporting documents are initially done on their Zoho CRM system, everything captured in Zoho must be manually downloaded and then uploaded into Nimbus to post the claim, which creates the claim on Rock ([00:10:00](#00:10:00)). After this initial manual posting, they primarily operate on Rock, but they use Zoho to collect and communicate with policyholders or brokers to manage the overall claim flow, as there is no integration between Zoho and the insurer systems ([00:11:03](#00:11:03)). Decision-making regarding claims, such as rejection or payment, is driven and managed off the Rock system, with communication sent out manually or scheduled via Zoho ([00:12:17](#00:12:17)).

* **Proposed Future State and Solution Overview**: Reuben John proposed providing an overview of their solutions and then workshopping an ideal future state workflow that RTU would like to achieve ([00:13:32](#00:13:32)). They are capable of automating the beginning of the process, including ingesting claims data and potentially automating the population of claims onto the Rock and Nimbus platforms, subject to architectural constraints. They can also automate certain customer interactions, such as requests for missing documents, which would reduce the need for manual, off-system communications ([00:14:28](#00:14:28)).

* **Core System Functionality and Fraud Intelligence**: The core system can organize claim data and documents, extract relevant information, contextualize it against policy terms, and provide a recommendation on whether the claim should be rejected or denied, complete with reasoning and a cost breakdown. A new fraud intelligence layer was introduced, which examines documents for tampering, checks for consistency across fonts, and flags potential fraud areas for further investigation ([00:15:49](#00:15:49)). The system also includes an analytics tool for live quality assurance, providing qualitative and quantitative elements of the claim and allowing for performance tracking of assessors ([00:17:00](#00:17:00)).

* **Integrating Business Rules and SLAs**: Vassen Moodley emphasized the need to track various elements of the claims process against set service level agreements (SLAs) and standards, including measuring items that are out of SLA for escalation. Reuben John confirmed they can build both policy-related terms and business rules, which relate to SLAs, risk tolerances, and minimum thresholds, into the process flow to track these critical elements ([00:18:20](#00:18:20)). Mike Mgodeli also noted the importance of managing the flow based on business rules for various claim intake channels (email, WhatsApp) to optimize their team's claim volume and ensure standards are maintained ([00:19:30](#00:19:30)).

* **Operational Volume and Next Steps for Workflow**: RTU currently processes between 80 and 100 claims per month, with this figure expected to increase with incoming portfolios ([00:20:54](#00:20:54)). Reuben John requested two workflow diagrams for an intensive hour-long workshop: one showing the current flow with all stakeholders, tools, and information movement, and a second to co-create an optimized flow. They need the SLA and policy terms upfront to correctly model them into the system for decision accuracy and coverage checks ([00:22:06](#00:22:06)).

* **System Design and Data Analytics Capabilities**: Reuben John explained that their system uses a combination of agentic workflows for orchestration and semantic reasoning, as well as deterministic flows for strict path adherence, enabling high accuracy and speed. In response to a query from Vassen Moodley, Reuben John confirmed that the system automatically captures all claim data, providing a sophisticated audit trail necessary for their regulated environment ([00:23:22](#00:23:22)). This data feeds into a customizable dashboard for statistics and metrics to track the health of the claims operation, which they can show in a subsequent demo session ([00:24:39](#00:24:39)).

* **Planning for Future Growth and Documentation**: Matthew suggested that Vassen Moodley and Mike Mgodeli, along with Steve, should put together the process documentation ahead of the next meeting, where they can then workshop the integration of the True Aim system. They noted that aggressive growth is planned for the next few months, and having new systems in place before books like the Zayn book and the Minx car fleet accelerate is crucial to avoid having to hire additional personnel ([00:25:45](#00:25:45)) ([00:39:04](#00:39:04)). Mike Mgodeli committed to sending the necessary workflow details by the end of the current week ([00:26:42](#00:26:42)).

* **Commercial Discussion and Proposed Timeline**: A mutual Non-Disclosure Agreement (NDA) template will be sent by Reuben John. The ideal next step is to have the workflow diagram in place and the NDA signed, with a target to reconvene the following Tuesday for a workshop. Implementation would then proceed via an aggressive, short sprint of two to four weeks, concluding in a pilot phase ([00:27:44](#00:27:44)). Commercially, there is no charge for custom development, and pricing is value-based, either per claim processed (ranging from approximately 40 to 150 South African Rand, based on current Swiss clients) or a usage/license fee for additional modules like analytics ([00:28:47](#00:28:47)) ([00:31:10](#00:31:10)).

* **Integration Challenges and Sharing Architecture**: Mike Mgodeli stated that direct integration with Rock would be difficult, as they are waiting for Rock 3.0, but that solving the operational side of gathering information and running the claim up until the decision-making is in their control ([00:34:55](#00:34:55)). Matthew offered to help source the basic architecture for Nimbus and Rock to share with the team, along with the custom configuration details of the Zoho CRM ([00:32:14](#00:32:14)) ([00:36:42](#00:36:42)). Mike Mgodeli provided an example of a desired workflow automation: having the system automatically flag the need to pursue a third-party recovery based on the description of loss ([00:33:06](#00:33:06)).

* **Exploring Ancillary Products for Automation**: Jonny Rosenberg suggested exploring the claims process for Value Added Products (VAPS) as a potential new, easily automated application, since these products might not have the specialized nature of the Heavy Commercial Vehicle (HCV) comprehensive claims ([00:36:42](#00:36:42)). Matthew confirmed that the ancillary products, such as excess reducers, make up a large portion of the HCV business and that their claims process might be much more automatable from day one ([00:37:47](#00:37:47)). The VAPS business is more established and significantly larger than the RTU operation in terms of premium written ([00:40:05](#00:40:05)).

* **Final Next Steps and Commitments**: Reuben John committed to sending a mutual NDA, a series of next steps, and a list of required items with guidance after the call, aiming to meet again on Tuesday of the following week ([00:34:03](#00:34:03)). Matthew will share typical monthly claim volumes related to ancillary products for the other company, H VAPS.co, for simultaneous review ([00:37:47](#00:37:47)).

### Suggested next steps

- [ ] Reuben John will send a mutual NDA template, a series of next steps, and a list of required items with guidance to the group.  
- [ ] Matthew will try to source and share the basic architecture for rock and nimbus ahead of the workshop, speaking to Herman directly if needed.  
- [ ] Matthew will share information regarding the typical number of claims per month and claims related to ancillary products for the other company (H vaph.co) via email.  
- [ ] Reuben John will send an overview of the weekly roll out for implementation to Mike Mgodeli's team.  
- [ ] Matthew will explore if there is potential for an easily automated approach for ancillary product claims with the other company (H vaph.co).  
- [ ] Reuben John and Frederic Brunner will aim to meet with Mike Mgodeli's team next week Tuesday for an hour.

*You should review Gemini's notes to make sure they're accurate. [Get tips and learn how Gemini takes notes](https://support.google.com/meet/answer/14754931)*

*Please provide feedback about using Gemini to take notes in a [short survey.](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=PRlQ45NS7Ge90GXkx3JSDxIUOAIIigIgABgDCA&detailid=standard)*

# 📖 Transcript

Mar 9, 2026

## True Aim \- Meeting (Matthew Rosenberg) \- Transcript

### 00:00:00 {#00:00:00}

   
**Frederic Brunner:** Hello.  
**Vassen Moodley:** Hi, how are you?  
**Frederic Brunner:** Good. Good. And you? Nice to meet you.  
**Vassen Moodley:** Good, thank you. This uh my name is Vasan.  
**Frederic Brunner:** My name is Frederick.  
**Vassen Moodley:** Hi. Uh Mike will be joining us right now.  
**Frederic Brunner:** Okay. Look, Reuben will be joining us now.  
**Vassen Moodley:** Great Tammy, you can hear me clearly.  
**Frederic Brunner:** Yes, it's totally  
**Vassen Moodley:** Fantastic.  
**Frederic Brunner:** fine.  
**Vassen Moodley:** I'm going to uh I'm not in a The signal may not be good here, so I'm just putting the camera off if you don't  
**Frederic Brunner:** That's fine. No problem.  
**Vassen Moodley:** mind.  
**Mike Mgodeli:** Hi. Hi, Frederick. How you doing?  
**Frederic Brunner:** Hello, M. Good. Good. Nice to meet you.  
**Mike Mgodeli:** Likewise, man. I'm with Venia just on the other side of the table.  
**Frederic Brunner:** Okay,  
**Mike Mgodeli:** Um,  
**Frederic Brunner:** great.  
**Mike Mgodeli:** we'll just dive in. Yeah.  
**Frederic Brunner:** Okay, look. Reuben will be joining us  
**Mike Mgodeli:** Hey, Ruben.  
   
 

### 00:01:23

   
**Reuben John:** Hi Mike,  
**Frederic Brunner:** shortly.  
**Reuben John:** how are you?  
**Mike Mgodeli:** Good. Thanks. Yourself?  
**Reuben John:** Good, good,  
**Vassen Moodley:** Hi Reuben.  
**Reuben John:** thankf. How are you?  
**Vassen Moodley:** Good  
**Reuben John:** Good, good,  
**Frederic Brunner:** Hi  
**Reuben John:** good. Am I pronouncing it correctly?  
**Vassen Moodley:** things.  
**Reuben John:** Vassan. Okay, perfect.  
**Mike Mgodeli:** Where you guys based?  
**Reuben John:** I know people were in Zurich in  
**Mike Mgodeli:** Okay.  
**Reuben John:** Switzerland and you  
**Mike Mgodeli:** Probably you in South Africa. Yeah.  
**Vassen Moodley:** Okay.  
**Reuben John:** Whereabouts? I'm a South African born and bred.  
**Mike Mgodeli:** Oh, really?  
**Reuben John:** Josie.  
**Mike Mgodeli:** Where about I  
**Reuben John:** Yeah. Um,  
**Mike Mgodeli:** said I'm saying that I think I caught the last part where you  
**Reuben John:** sure. I mean, sorry, what did you say?  
**Mike Mgodeli:** said you're in Jersey. You are from Jersey.  
**Reuben John:** Yeah. Originally, originally.  
**Vassen Moodley:** Okay. Now we are job based as well.  
**Mike Mgodeli:** Okay.  
**Reuben John:** Okay. Good, good, good, good.  
   
 

### 00:02:12 {#00:02:12}

   
**Reuben John:** Fred's uh Fred's wife is also uh not by descent but by birth South African as  
**Mike Mgodeli:** I love it.  
**Reuben John:** well and uh have quite a strong connection to South Africa and it's actually the two markets where we  
**Vassen Moodley:** Okay.  
**Reuben John:** have the the most traction with our product are Switzerland and South  
**Mike Mgodeli:** Oh, lovely.  
**Reuben John:** Africa.  
**Mike Mgodeli:** That's awesome.  
**Reuben John:** Super. Is Jonathan Sorry, not Jonathan. Is Matthew joining  
**Mike Mgodeli:** Um, they probably jump in.  
**Vassen Moodley:** Met.  
**Reuben John:** us?  
**Mike Mgodeli:** Um, but I think we can probably kick off on our side. I think Vos operates is the the driver of the the operation the um and then um we we're the guys who do the work. on the grant stuff um and the management side of the business. So maybe a bit of a background on on what we do as RT.  
**Reuben John:** Mhm.  
**Mike Mgodeli:** So RT is um a um underwriting manager in the space operating in the passenger transport space. So we traditionally were renounced taxi underwriters on the minibus taxis but we've got a strong focus on your e-hailing market which is your bolts Ubers um in drive in South Africa.  
   
 

### 00:03:17 {#00:03:17}

   
**Mike Mgodeli:** Our offering is to your individual owners, to your fleet clients, um the whole the whole spread. Um we we run a very small team.  
**Vassen Moodley:** Six.  
**Mike Mgodeli:** I think we've got eight a team of eight or nine in RTU servicing more than 200 brokers um currently in the market.  
**Vassen Moodley:** Wow.  
**Mike Mgodeli:** So obviously our biggest our fundamental offering we say is the claims process is the windows to the actual insurance product and we tried to be as efficient as possible on the claims process. So we're really looking forward to you guys walking us through your process, what your your thoughts around it and what your offering is. Um we you're future thinking, we forward thinking and we want to find the solutions for the future in this space. Yeah.  
**Reuben John:** Perfect. Thanks a lot. How's it right?  
**Matthew:** Hello  
**Reuben John:** That's all good.  
**Matthew:** guys.  
**Reuben John:** Mike, Mike, small note. the the quality of the sound is not great on your side. I think it's probably just the mic not being close to your phone and close to your mouth.  
   
 

### 00:04:25

   
**Reuben John:** I don't know if we can adjust a little  
**Matthew:** It might I don't know if if you and Vice are together.  
**Reuben John:** bit.  
**Matthew:** It might be picking up on both sides.  
**Vassen Moodley:** We actually Yeah,  
**Matthew:** Are you together?  
**Vassen Moodley:** we are together. Oh, are you picking up an  
**Matthew:** Yeah,  
**Reuben John:** Yeah.  
**Vassen Moodley:** echo?  
**Matthew:** there was a bit of an  
**Reuben John:** Echo. And there's quite a bit of background noise.  
**Matthew:** echo.  
**Vassen Moodley:** You sell the I have  
**Matthew:** You there, Mike?  
**Vassen Moodley:** this.  
**Reuben John:** all good, Matt.  
**Matthew:** Well, good. So, how you doing?  
**Reuben John:** Busy, but good.  
**Matthew:** Busy.  
**Reuben John:** Yeah. Yeah.  
**Matthew:** Good. Good.  
**Reuben John:** I'm actually coming through to I'm coming through to London  
**Matthew:** Busy.  
**Reuben John:** next week.  
**Matthew:** When?  
**Reuben John:** I think it's the 18th and 19th. 18th. Yeah.  
**Matthew:** Okay.  
**Reuben John:** There's an insurance summit there um that I'm coming to attend. Are you are you going?  
**Matthew:** No,  
**Reuben John:** It's this global insure tech summit.  
**Matthew:** I'm not going.  
   
 

### 00:05:37 {#00:05:37}

   
**Matthew:** No, no, I'm not going.  
**Reuben John:** Okay.  
**Matthew:** But I'll be here. So, let me know when you're  
**Reuben John:** Yeah.  
**Matthew:** around.  
**Vassen Moodley:** Sorry guys.  
**Reuben John:** I'll let you know.  
**Vassen Moodley:** Is the background noise still bad or must I Okay,  
**Matthew:** Yeah, it's not great, V.  
**Mike Mgodeli:** Can you can you hear me now?  
**Vassen Moodley:** wait. Right.  
**Matthew:** Uh, yeah, I think a bit better, but there is a bit of background noise.  
**Mike Mgodeli:** Okay,  
**Vassen Moodley:** I'm going to sit in the car and we'll chat to you from the  
**Mike Mgodeli:** Oh,  
**Vassen Moodley:** car.  
**Matthew:** Okay.  
**Reuben John:** Hi Jonathan, how are you?  
**Frederic Brunner:** Hello  
**Jonny Rosenberg:** Hi Frederick.  
**Mike Mgodeli:** cool.  
**Matthew:** Am  
**Jonny Rosenberg:** Hi Ruben. Hi V.  
**Mike Mgodeli:** John.  
**Jonny Rosenberg:** Hi  
**Frederic Brunner:** Johnny.  
**Reuben John:** Jonathan,  
**Jonny Rosenberg:** Mike.  
**Mike Mgodeli:** All right,  
**Matthew:** I  
**Mike Mgodeli:** I think we can kick off. I think we can kick off then.  
**Reuben John:** right?  
**Mike Mgodeli:** Voscel find a quieter place. Um,  
**Matthew:** just  
**Mike Mgodeli:** we're just running after our last meeting.  
   
 

### 00:06:36

   
**Mike Mgodeli:** So, we just found a coffee shop, but it seems a bit noisy. So, V will join in the car just trying to find a quieter spot. But I think we can kick off bus.  
**Matthew:** sorry? Did you guys do a round of introduction group? Sorry. When I when I joined it sounded like Mike was giving a bit of a  
**Reuben John:** Yeah,  
**Matthew:** background.  
**Reuben John:** basic overview of the company, how it operates, the team, etc. But two minutes, two two minutes uh story so we up to  
**Matthew:** Okay.  
**Reuben John:** speed.  
**Matthew:** Okay. Perfect. Um Mike, I don't know if Steve's joining. I know that Steve would uh I think would be particularly beneficial, but um assume assuming he's not, do you want to when you get a chance just run through the sort of general systems at the moment um and then sort of let's dubtail into um True Aim and what they currently have and and where that could potentially slot in.  
**Vassen Moodley:** uh that I I will do that. I will keep him a breast of what's  
   
 

### 00:07:45 {#00:07:45}

   
**Matthew:** Okay. The So I was saying, do you do when you get when you get a chance,  
**Vassen Moodley:** happening.  
**Matthew:** Mike,  
**Mike Mgodeli:** Yeah.  
**Matthew:** do you want to just give an overview of the current  
**Mike Mgodeli:** Yeah. Perfect. I'll I'll drive us I'll walk us through the systems.  
**Matthew:** systems?  
**Mike Mgodeli:** Um just on the I've just um P Steve to see if he can join us. But um currently our operations ribbon is we operate on our own internal Zo system that effectively manages your ticketing. So we went from we moved from I said I'm going to mute you just mute when you're not talking. Um so we've gone from purely an email based uh flow some a broker would send us an email with a claim manual claim form um that they would cap recapture that on the insurer system.  
**Reuben John:** Mhm.  
**Mike Mgodeli:** So the insurer operates on two systems called two administrator systems Nimbus and Moroc system which effectively  
**Matthew:** which is what we spoke Yeah. which is what we spoke through before guys. So those are the Yeah.  
   
 

### 00:08:40 {#00:08:40}

   
**Matthew:** So the those are Renas systems.  
**Mike Mgodeli:** yeah  
**Matthew:** Um uh so the actual claim would be managed there. I think Mike's now referring to the CRM system that he uses to sort of help help bolt onto that to manage tasks and so  
**Reuben John:** Okay. So there just to clarify there's Nimbus which we're aware of Jonathan you'd mentioned this even in our first  
**Matthew:** on.  
**Reuben John:** discussion and what's the other  
**Mike Mgodeli:** The other system is rock. So rock actually so Nimbus if if not Nimbus and how it's currently set up in our environment right Nimbus is  
**Reuben John:** tool  
**Mike Mgodeli:** where all your policy management takes place. So where the risk lies, whether the premium supposedly is collected and and not collected and from a claims first notification of loss process, it will be triggered off off Nimbus. Um and then Nimbus that would then send through to Rock and then the entire claims management process  
**Reuben John:** Mhm.  
**Mike Mgodeli:** takes place on Rock. So on rock your assesses are are appointed your suppliers are are flagged on rock um your payments are settled all the claims data lies in rock um I'm still yet to see any form of integrations in there so good luck um what we then do on our side is the the claims management process takes place on on our CRM system called Zoa so it's a offtheshelf system that we've configured where a user and log the claim.  
   
 

### 00:10:00 {#00:10:00}

   
**Mike Mgodeli:** We'll manage the claim from start to finish on on on Zoho, submit the info on to Nimbus and manage the the actual doing of the claim on Rock. So that's the systems we're currently operating and using on our on our side.  
**Reuben John:** Okay. So,  
**Matthew:** Mike just to clarify sorry can I just clarify from my side it may be beneficial for the other guys as well uh  
**Reuben John:** it's  
**Matthew:** in terms of what you're capturing on uh on Zoho you're not actually putting claims related documentation into Zoho are you because it's not integrated to numbers or it  
**Mike Mgodeli:** Yeah. No, so we actually do the full claims registration on Zoho. So the claim form is actually embedded on Zoho in our world with the supporting documents with the triggers and and and and and the whatever we need from a client point of view. Once they've completed that, we effectively take that info and we post it onto Zoho onto Rock to to run the claim. So that full claim form will come from Zoho. The supporting documents like your pictures and the whole works will come from Zoho in our world.  
   
 

### 00:11:03 {#00:11:03}

   
**Mike Mgodeli:** We effectively download that info and then upload it on rock to to run the system. So it's saying integrations, it's something that doesn't take place on the system.  
**Reuben John:** Okay. So just to understand so it goes from Zoho the information is downloaded into rock is the information shared automatically with Nimbus as well or so which parts in the flow are manual versus  
**Mike Mgodeli:** Everything is everything that we capture from Zoho we download manually.  
**Reuben John:** automated  
**Mike Mgodeli:** We capture that into Nimbus which will post the claim which creates a claim on the rock. Then once it's done we don't actually interact with Nimbus again. Right. The next part we just operate purely on Zo. So on Zo we'll upload the claim form. Sorry on Rock we'll upload the claim form. We'll we'll we'll put the assessor's quote on rock. We'll put the pictures on rock. will put the the whole workings of the actual claims process on on rock. So the claims file and data lies on rock which we using the our Zoa CRM to collect and communicate with the with the policy holder or with the broker and manage that whole flow outside of the system and there's no integration.  
   
 

### 00:12:17 {#00:12:17}

   
**Mike Mgodeli:** So whatever we're doing on the one end, we'll download and upload and update on rock to to manage.  
**Reuben John:** Okay. Customer communications,  
**Mike Mgodeli:** Currently  
**Reuben John:** are they dealt with on a specific platform and then sent through a platform or are they off platform and manual?  
**Mike Mgodeli:** they they they'll be manual or scheduled of Zo. So that's the only customer coms we're running from a from a claims point of view. So like if you're following up or we've got outstanding documents,  
**Reuben John:** Okay.  
**Mike Mgodeli:** if we've got escalations that runs off Zoho um that's that's not of the Rockall numbers.  
**Reuben John:** Okay. And ideally when it comes to recording a claim decision, your decision on what you do, reject, pay, etc., where would be your central record keeper for that? Would that be Nimbus or would that be Rock?  
**Mike Mgodeli:** that would come that would come of rock. We would we would effectively take the info from rock and it's communicated out of a zo or if it's directly from rock it will go from rock to the client but the decision makings and all things to do with the insurance are managed and driven off rock system.  
   
 

### 00:13:32 {#00:13:32}

   
**Reuben John:** Okay. Okay. Before I tell you what we do, I'm going to pause for just one second. Fred, what I want to do is give them an overview of what we do and then ask them to describe exactly how it an ideal world would look for them, how things would operate, but I want to pause quickly. Do you have any questions further on this topic before Okay.  
**Frederic Brunner:** I mean, no, I'm I'm good. That's  
**Reuben John:** Okay.  
**Frederic Brunner:** good.  
**Reuben John:** Perfect. Um, guys, if it's okay for you, I'll just give you an overview of the solutions that we provide. What I'd like to do then is hear from you what an ideal future state would look like. We can guide you and we can tell you what best practices look like and we can tell you what our functionalities are and the benefits of those. But if you could wave a magic wand so to speak and say this is what the workflow would look like and here's what our involvement would be that would be very good for us to understand what the end target looks like.  
   
 

### 00:14:28 {#00:14:28}

   
**Reuben John:** We can workshop this. We'll go into more detail. it's purely to get um an indication and direction. So what we're capable of doing is automating the beginning of the process. So everything from the ingestion of the claim from the customer. So from Zoho we would be able to get that documentation and hopefully and I mean subject to looking at the platforms that you're using in Rock and Nimbus hopefully automate the population of claims on the rock platform and the relevant details going into Nimbus where required as well um with supporting documentation with information etc. Again, subject to the constraints. Fred will need to look at the architecture and make sure it's possible. But in a perfect world, we'd like to hopefully automate all of that. We can then automate the customer interaction. So, for example, let's say they're missing documents or uh missing information from the claim. Hopefully, we can reduce the amount of uh customer communication required that is manual and off system. So this could be automated emails saying please give us this additional document or additional information or provide the following or we can give you draft emails that you can generate on system or through our system that you can then copy and paste and tweak in order to do your customer communication.  
   
 

### 00:15:49 {#00:15:49}

   
**Reuben John:** Our core system is then capable of taking the documents and the data, organizing it, extracting the relevant information, contextualizing it, looking at it in relation to the policy terms and coverage, giving you a recommendation on if the claim should be rejected or denied along with reasoning as well as a cost breakdown relative to what the customer is claiming. So, in the use case for a car, let's say there's labor and there's parts and they're claiming replacement of certain things. We can verify according to your policy terms what would be covered and what would not be. Um, with the ability for you to add and tweak in case there are situations where we haven't been able to determine coverage with 100% accuracy. Um, we then push that through to you for finalization and editing. And then on the back end, we can also um assist with the customer communications, automating responses relating to those decisions, telling them that they've been paid or denied and giving reasons and explanations for it. And then we have also a fraud intelligence layer, which is actually new, Matt.  
   
 

### 00:17:00 {#00:17:00}

   
**Reuben John:** We hadn't presented this to you guys when we first spoke, but fraud is obviously a big topic. So the documents run through an intelligence layer which looks at everything from is the template being used uh correct from the from the uh from the quotation. Um we use semantic reasoning to pick up does the chronology and story actually make sense. We look at compression and um of artifacts on the documents. So have logos been possibly falsely applied to the documents in a fraudulent way. uh is there consistency across the fonts um etc. All looking for for areas where we can pick up that documents have been tampered with um and then we push those through or flag them to you to say guys something looks a little bit funny here maybe you should investigate that a little bit further. Um on the very back end we then have an analytics tool which allows you to look at the quality of the claims being processed kind of a live quality assurance if you want to look at it that way. Um, it will show you all of the qualitative and quantitative elements of the claim and it will allow you to break down on a per assessor level, how well they're performing, the turnaround times, um, the accuracy of their decisions, uh, the benchmarking of their decisions relative to their colleagues and how your company wants to perform.  
   
 

### 00:18:20 {#00:18:20}

   
**Reuben John:** Um, so that you've got an overview of your the health, let's say, of your claims operation in real time. So, I'll pause there for a second pretty much end to end.  
**Matthew:** take that. Thanks, Ruben. I think that and that last part's I think particularly relevant here, Vas and Mike, given sort of all of the stuff we've been going through in the last two weeks to get that process a bit more streamlined and and so on. Um, do you have any do you have any specific questions or comments on that part?  
**Vassen Moodley:** Uh I'm sure I've got still a lot of background noise, but just quickly what we what we'd like to do is track the various elements in a process. There's certain SLA or standards that we've set up and in order to measure what is out of SLA and what needs to be escalated. That's something that will help manage the claims process a lot better. So what's your thoughts around that?  
**Reuben John:** So we can build in policy related terms. We can also build in business rules as we call them.  
   
 

### 00:19:30 {#00:19:30}

   
**Reuben John:** Those are the two rule sets. The business rules relate to anything surrounding service level agreements, minimum thresholds, risk tolerances, things that live outside the body of the contract. So, we need to workshop this with you, but we can build all of that into the process flow as well, so that we're tracking those elements.  
**Vassen Moodley:** Thanks for that because that's that's an important cog in this bill for for us actually. Is  
**Reuben John:** Understood.  
**Vassen Moodley:** there anything else you want to  
**Mike Mgodeli:** I think on my side it's probably the it's the channels on how we obviously get claims coming in. So we currently would get claims via an email, we'll get a claims via a WhatsApp channel. Um so I think it's that full we need to curate that entire claim journey um and and marry those two with the with the SLAs's the business rules and then the the second layer on my view that like the decision making or the decision making to proceed or decline that would be an escalation because we need to motivate that into a renosis table for instance to say guys having looked at all of these merits this is what we recommend we do and then they would guide us on on that.  
   
 

### 00:20:54 {#00:20:54}

   
**Mike Mgodeli:** And I think if I've heard you correctly, Reuben, the other part you guys look at is the assessment decision of whether a claim should proceed and quantifying of that cost. Um, but to get to that part, you'd obviously need to have sight of the pricing and SLAs's up front before your your decision making can take place. So in my view, I think it's probably managing the flow from a business rules, how a claim comes in, what should happen when a claim comes in, what are the escalations, cuz ultimately we're managing a team of four or five five claims agents and we want to make sure that it's optimized and we can increase the volume of of claims that we we we we're driving within a SLA of those four people and ensure that the standards are in face and then we can get to the the next layers of it.  
**Reuben John:** Understood. Approximately how many claims are you processing every month? I'm sure it it varies, but just so we have an indicative figure.  
**Vassen Moodley:** between 80 and 100 claims a month.  
   
 

### 00:22:06 {#00:22:06}

   
**Vassen Moodley:** There are a few other portfolios that are coming through so that figure will change but currently between 80 and 100 claims.  
**Reuben John:** Okay. Between 80 and 100\. Okay. Ideally, we'd need to see two workflow diagrams. I would love to workshop this with you in a proper hourong session where it's guided. We'll send you some preparation beforehand, etc., so we can maximize the output of that session. But ultimately, we'd love a workflow showing all of the different stakeholders, parties, and tools involved combined with the flow of information and back and forth. And then we will help to create simultaneously with you during that workshop what we believe is an optimized flow so that there's reduced friction across stakeholders, reduced friction across platforms, better customer communication, SLA referencing, and then obviously policy referencing. And I agree, we need to get the SLA and policy terms correct so we can model them, which will then allow us to help you with your decision accuracy and coverage check. So, it's all neatly woven together, but we need to see a little bit more on how your world currently works and then we can present to you how we think it could work and workshop that with you so we know what we're building.  
   
 

### 00:23:22 {#00:23:22}

   
**Mike Mgodeli:** Assuming you guys obviously operate similar to like a work it's like it's effectively like a workflow management tool. Would you operate it in a sense of like an agent that handles these items or how would you actually practically operate this or run it?  
**Reuben John:** It's a combination of agentic workflows mainly for orchestration and sometimes for reasoning semantic reasoning but we also do have deterministic uh flows built in where it follows a very strict path. There's no interpretation from an agent at all. And it's the combination of those two things which allow us to provide a high degree of accuracy as well as speed.  
**Vassen Moodley:** One more question uh in terms of statistics and uh developing of reports and things like that. Is there a layer that can do this?  
**Reuben John:** Yes. So all of the data is automatically captured on our system. Everything from we're coming from a highly regulated environment here in Switzerland. We're regulated by the EU AI act as well as various others and they place quite a high demand on the ability to audit the claim and the life cycle of the claim.  
   
 

### 00:24:39 {#00:24:39}

   
**Reuben John:** Who's making decisions? Is it a machine? Is it a human? Where is their human in the loop? Etc. etc. So what we have on the back end is a very sophisticated audit trail of how that claim is being handled from start to finish. What that allows us is a large amount of data. That data can be pulled into statistics that will help you um look at the life or rather the health of your claim as it moves through a particular system. So we have a dashboard which we're happy to show you in another session which will give you an indication of the type of statistics that we can show you. But at the end of the day, we can customize it. So if you want a particular metric because it matches with your SLA, you tell us what you want and we can we can create something to match  
**Matthew:** Yeah.  
**Reuben John:** it.  
**Matthew:** So I think shared some of the documentation um giving a high level overview but I think the it would be particularly useful to run uh through their systems as a demo but in a in an environment where I think as Ruben suggested let's get some work on on our side and vice to put the processes together.  
   
 

### 00:25:45 {#00:25:45}

   
**Matthew:** I think that'll be constructive ahead of a sort of next meeting. Then go into sort of a workshop environment. Let's demo the true system and then uh and then sort of run through how that could fit into the process um document that we that we sort of put together to to make sort of most constructive use of the time. Uh I do think it would be useful for Steve to be in that call given the sort of uh system related elements he's embedding in various parts of the journey. Um so let's just align with him on that. And then lastly, we uh Vas briefly mentioned it guys, sorry, but there's plan to be some aggressive growth over the next uh few months um in terms of some books that we're taking on. So it would be good if you know we can get um you know sort of something in place to do so ahead of that uh that growth. Mike and Vus, I don't know if you agree, but um you know before sort of to get without getting too specific on the growth, but before you know sort of Zayn Zayn comes into the picture and the Minx car fleet um you know sort of has another  
   
 

### 00:26:42 {#00:26:42}

   
**Vassen Moodley:** Uh  
**Matthew:** accelerated uh batch of growth, it would be good, I think, to to get any systems that we we believe will be uh useful going forward in place and and operating.  
**Vassen Moodley:** yes,  
**Mike Mgodeli:** people.  
**Vassen Moodley:** totally agree.  
**Mike Mgodeli:** Yeah. So I think look on our side is we've already done a lot of the the ground work on the on the specking of the system what we expect the systems to do on our side which which also entails the the workflows. So to turn that around should not be a big uh a big a big a big job. Um so let's let between V myself and Steve send something through to you by the end of this week and then we can take it from there. How does your current um model work from a commercial point of view? Do we have anything in place? Matt from NDAs with the team.  
**Matthew:** No NDAs. Um I mean we Yeah, I don't think we have an India in place. It might be worthwhile getting one in place in the time.  
   
 

### 00:27:44 {#00:27:44}

   
**Reuben John:** We don't.  
**Matthew:** Yeah.  
**Reuben John:** Yeah. So, I've got a mutual NDA template. So, I will send that through to you guys.  
**Matthew:** Yeah.  
**Reuben John:** Just mind mapping this inside my head how I think it would would play out. Just due to some travel that's going on on our side in the next week or so. If we could aim to get that workflow diagram in, have an NDA signed and perhaps reconvene Tuesday next week, that would be kind of an ideal one-week chunk that we can do. And over the course of that week, we'll also share with you how we envision the weekly roll out to occur. Just so you know, in terms of our operation for implementation, we like to do this as an aggressive short sprint of two to four weeks at the end of which we go live um in a pilot phase at least um and from there we can quickly iterate. The whole idea of building a system to make it perfect doesn't exist. We'll get it as close to spec as we possibly can, deploy it, ramp it up, iterate, the system will learn, and then we can quickly get a model in place that works for everybody.  
   
 

### 00:28:47 {#00:28:47}

   
**Reuben John:** Commercially, there's no charge whatsoever for any of the custom development that we do on top of our core platform. We only charge if you end up using the platform. And those commercials are valuebased. So we look at the impact we're having on your business and we come to a commercial model which balances affordability with the value ad that we get. So it's a little bit further down the line once we've built something a bit more uh usable that you can see and after we've given you a demo. Um but that's typically how we do our pricing and commercials.  
**Mike Mgodeli:** That that's a bit of a that's a very salesman talk that um but uh thanks for that. I think um just give a give an idea on our side doing 80 to 120 claims that we're currently running for a very small operation. Yeah. But the the one thing I think we'll be able to have shed value for both your side and understanding our market and our space and what you're doing. Yes, you're doing a lot of work within the insurance space in South Africa.  
   
 

### 00:29:50

   
**Mike Mgodeli:** um but you're dealing with one extreme part of the market which is the minibus taxes and the e-haling side. So I think there's a lot of there's a lot of common um benefit to to both parties. Um just just think around how we can solve for it so we can make the the business call and decision on proceeding and and and putting in the investment on both ends. you know, if we want a long-term solution that will enable us to really drive what we're good at is um piecing the piecing everything together and work with people that we can co-create and build with. You know, instead of an off-the-shelf system that we can configure and tweak, we can solve such a solution and and make it something really commercially viable for both yourselves and us.  
**Reuben John:** I'll say touche. That was an equally salesy uh comeback on your side. I fully understand what you mean. Will align on pricing. Just so you know when it comes to the actual pricing that we do and the reason why I don't give a specific figure we have some clients where it's a relatively simple application and we do it on a per claim process through our system basis and then we have other clients where we have additional modules on dashboards and analytics and reporting and the two commercial models on a per claim basis as well as a license fee or usage fee for analytics are different.  
   
 

### 00:31:10 {#00:31:10}

   
**Reuben John:** So, I can't price until such time as I have a better understanding of exactly what we'll give you. But you have my commitment and undertaking that the pricing will be transparent. We're not going to build something for four weeks and then hit you with a big bill that makes it impossible for this to to work. The idea is we need to implement it. We want to generate revenues through you and we'll figure out a way to make it transparent as soon as possible once we know a bit more about what we'll be building for you.  
**Mike Mgodeli:** on your per claim process. What does that look  
**Reuben John:** per claim process and indicative. We currently have uh customers that are on around two Swiss Franks and 10  
**Mike Mgodeli:** like?  
**Reuben John:** cents per claim processed which is around 40 45 rand roughly and we have others where the complexity of those claims are far more complex and there they closer to 770 or 780 Swiss Franks which is around 150 rand per claim processed. Um so you're kind of in that range subject to what we need to build for you.  
   
 

### 00:32:14 {#00:32:14}

   
**Reuben John:** Um but again those are denominated in Swiss Franks um and not for the South African market. So I would like to be more transparent but I can only give you an indication based on current customers in  
**Mike Mgodeli:** No, that's I appreciate that.  
**Reuben John:** Switzerland.  
**Mike Mgodeli:** Thanks for that.  
**Matthew:** And if I can suggest just one more thing to share Mike and Vas ahead of the meeting I can also sort of try and help source this if  
**Reuben John:** Pleasure.  
**Matthew:** necessary is the architecture for rock and nimbus whatever basic sort of overview of their architecture to um to share to share with the guys ahead of the workshop just so that they know what they're dealing with from an integration perspective um up front and and uh the Zoho stuff I mean Zoho is just a CRM Right. Which you've custom configured. Mike,  
**Mike Mgodeli:** Yeah,  
**Matthew:** I don't know if there's anything you can share that. I guess that'll go into the process flow documents more than  
**Mike Mgodeli:** that's very simple.  
**Matthew:** anything.  
**Mike Mgodeli:** I think on on the on the process flow, it will be up there on our side.  
   
 

### 00:33:06 {#00:33:06}

   
**Mike Mgodeli:** It's effectively just managing that whole claim process, you know, and I think it's it's the operational side of it is you've got things that a human should really not be doing and you've got the things that the human can step in and intervene on. So um I'll I'll I'll apply my mind on what we're currently doing and how we can actually do it um better. So just a simple example, Matt, we we capture the whole claim process or the description of loss under in that digital claim form, right? But it still requires a human to decide to pursue a third party. But based on that description of loss that should be pinging on the system like dude someone you say someone drove in the back with you have you followed you kicked off the third party recovery stream.  
**Matthew:** Yeah, exactly.  
**Mike Mgodeli:** So all of those things we've got the the foresight on how to to plug it in but we just needed the the execution layer and uh and I hope Ruben and Frederick can help us with that.  
**Matthew:** Okay, sounds  
**Reuben John:** This is super useful.  
   
 

### 00:34:03 {#00:34:03}

   
**Reuben John:** The idea is we we try to replicate the brain of the organization in the  
**Matthew:** good.  
**Reuben John:** tech that we build for you. So all of these nuance things about how you think about making decisions, your risk tolerances, these are all very important for us to build in. What I'll do after this call, I will provide you with a series of next steps. I'll send a mutual NDA and then I will send you a list of items that we require from your side along with some guidance based on the implementations that we've done and then let's aim to possibly meet next week Tuesday. Um if we can find a slot for an hour then I'll send you some availability and if we aim towards that I think we should be good.  
**Matthew:** Great stuff. Thanks for making the time, guys. Appreciate it.  
**Vassen Moodley:** Thanks.  
**Matthew:** Apologies,  
**Vassen Moodley:** Thanks.  
**Reuben John:** Perfect.  
**Mike Mgodeli:** Thanks.  
**Frederic Brunner:** Thank you so  
**Vassen Moodley:** Really appreciate the time.  
**Matthew:** I think.  
**Reuben John:** Thanks everyone.  
**Jonny Rosenberg:** So,  
**Vassen Moodley:** Cheers.  
**Jonny Rosenberg:** Matt Matt,  
   
 

### 00:34:55 {#00:34:55}

   
**Reuben John:** See you soon.  
**Matthew:** Yeah.  
**Vassen Moodley:** Bye-bye.  
**Jonny Rosenberg:** I've just got an idea um where there might be an application for VAP.  
**Mike Mgodeli:** Sure.  
**Jonny Rosenberg:** So, we can release Vassin and Mike. Mike, I'm going to give you a call just now about something.  
**Mike Mgodeli:** Thanks. Sean, just one thing,  
**Jonny Rosenberg:** Okay.  
**Mike Mgodeli:** Matt, you're not going to get integrations with uh with Rock. Apparently, they're building Rock 3.0. I'm still waiting to see that. So, so maybe if we can just maybe drive that with uh I don't know who heads up that. Maybe um Herman and Austin's team can help us with this part,  
**Matthew:** Yeah,  
**Mike Mgodeli:** but it's always it's always it's always easier for us to  
**Jonny Rosenberg:** Sorry.  
**Matthew:** I'll no I think Mike's  
**Jonny Rosenberg:** Integration between what and what Mark and  
**Mike Mgodeli:** rock. So, remember  
**Matthew:** talking about a direct integration into into rock,  
**Jonny Rosenberg:** what  
**Matthew:** but Nimbus is perfectly integrated, right? And and Nimbus does allow a lot of the capturing and so on.  
   
 

### 00:35:44

   
**Mike Mgodeli:** Yeah, that that's that's a theory side.  
**Matthew:** So,  
**Mike Mgodeli:** So I think what we'll do is we'll we'll um we'll solve the operational side in gathering the info because once the info is captured and running within our portal and platform the integration to the various systems we can we can drive and push for it and  
**Matthew:** Yeah.  
**Mike Mgodeli:** you you're going to come even on the what what other portfolios we're going to be doing commonly in the for  
**Matthew:** Okay.  
**Mike Mgodeli:** group you're going to come to the same um blockers when it gets to the the insurance system Right. What's in our control is running the claim from start up until the decision making side and then from a  
**Matthew:** Yeah.  
**Mike Mgodeli:** triggers point of view, integrations become easier. Um, and I think when we've got the the pot of work between the two in the foot, we can influence getting those integrations in place.  
**Matthew:** Yeah, that's fine. But look, I do think we'll be able to get some form of basic architecture to share with the guys. I'll if I need to, I'll speak to Herman directly on that and he he should be able to share something.  
   
 

### 00:36:42 {#00:36:42}

   
**Matthew:** Um, but yeah. Okay, take your point, Mike. Okay. Okay.  
**Jonny Rosenberg:** Okay.  
**Matthew:** Yes.  
**Jonny Rosenberg:** Cheers.  
**Reuben John:** Cheers,  
**Jonny Rosenberg:** Cheers. Uh Matt,  
**Reuben John:** guys.  
**Jonny Rosenberg:** so it just occurs to me now. So the reason I didn't suggest that we approach VAPS for this was because of the specialized nature of the HCV uh claims and uh and their settlement. But that might not apply to the value added product claims. And in fact those value added products might be very well suited to this type of automated um approach because uh as you just need the primary policy to respond and that's you know uh that's about all that's required and then uh the value added responds immediately. So and becomes a simple process. So that might be um an easily automated thing. I'm not sure what the volume they've got a big book, but I'm not sure what the volume of claims is. Do you know what the volume of uh  
**Matthew:** I'm not as you talk as you're talking I'm pulling it up now.  
   
 

### 00:37:47 {#00:37:47}

   
**Jonny Rosenberg:** value  
**Matthew:** Um I should be able to get it off the general MRA report but basically let me just summarize for the guys what what you're talking about. We're talking about um a big age. So what we the guys we just spoke to now are running a a mobility insurer. So things like Uber, Bolt, minibus, taxis. Um and it's, you know, fully comprehensive insurance, a lot of fleet business, which is why we think some sort of um automated processing would be hugely beneficial on these massive fleets with sort of uh you know uh very specific vehicles and so on. Um the HCV business is another much bigger business which will much have much higher claims volume. Typically the comprehensive portion of that is is a lot more specialized in nature. um and and likely harder to automate at this stage um or at least automate fully at this stage. But within that business, there's a large portion of what what I think you would call in the UK and Europe ancillary  
**Reuben John:** Mhm.  
**Matthew:** products. So commercial motor ancillary products things like excess reducers um you know sort of car hire maybe not the most relevant example but those types of ancillary products um that make up actually a large portion of the business.  
   
 

### 00:39:04 {#00:39:04}

   
**Matthew:** Um it's they actually started by developing incillary products before going into the sort of fully comprehensive space and those products might be the claims process on those products might be a lot more automatable from day one. Um so that's something I can share I can share some of the sort of high  
**Reuben John:** Perfect.  
**Matthew:** level on let me just pull it from this report I can share shortly after the meeting sort of typical number of claims a month and typical number of claims that relate to ancillary products and then we can explore if there's if there's something else there.  
**Reuben John:** Sounds good.  
**Matthew:** Okay.  
**Jonny Rosenberg:** cuz I mean that volume must exceed what we're talking about in uh in RTU.  
**Matthew:** Yeah. Yeah, should I look I'll look I've got the report now, but I made the point and I think it's an important point that the volume in RTU if everything that's planned over the next short while comes off is going to be is it the the growth's going to be quite quite steep and aggressive. So it would be good to have processes like this in place first.  
   
 

### 00:40:05 {#00:40:05}

   
**Matthew:** So you know if the Zane book comes across if the my next car ramps up like it's projected to ramp up and so on. Um it just yeah it'll avoid having to you know hire a whole lot more personnel  
**Jonny Rosenberg:** Yeah, exactly. Okay.  
**Matthew:** which  
**Jonny Rosenberg:** So, that's a another that's another initiative that uh I didn't think of.  
**Reuben John:** Okay.  
**Jonny Rosenberg:** Um, it's just occurred to me now that might uh that might  
**Reuben John:** Perfect. We'll have a look at it.  
**Frederic Brunner:** Fantastic.  
**Reuben John:** Matt,  
**Jonny Rosenberg:** work.  
**Frederic Brunner:** Yeah.  
**Reuben John:** if you send us that and the name of the company just so we I mean we're now tracking um RTUSA is one call a deal or need and then if you could just get the other one on board so  
**Matthew:** Yes,  
**Reuben John:** we can simultaneously look at their their  
**Matthew:** perfect. Yeah, the company would be H vaph.co.  
**Reuben John:** tracking.  
**Matthew:** But I'll put it in the mail for you as  
**Reuben John:** Okay,  
**Matthew:** well.  
**Reuben John:** awesome.  
**Jonny Rosenberg:** RTU is a a small operator and always has been and uh operating in the market it is it's um been reduced significantly in size to clean up the books.  
   
 

### 00:41:11

   
**Jonny Rosenberg:** So now Matt and I are really for the first time in many years paying proper attention to that company. But it has a potential because of its the big fleet nature of the market servicing. It's got the potential for very steep growth. Um the other company is is more significant. So they they're writing 700 million rand. I mean it's not much in Swiss Franks but it's uh I mean it's a it's an you know proper established business good underwriting profitable uh from an underwriting point of view and obviously itself. So um so that's much more much more established and um we we're quite heavily involved with that. So um and and that will develop further with other classes of business and so on. But to to start with this uh these ancillary so-called ancillary products or value added products as we call them here is potentially a good opportunity.  
**Reuben John:** Great.  
**Jonny Rosenberg:** Matt,  
**Reuben John:** Sounds  
**Jonny Rosenberg:** do you want to take that up with uh should I speak to Aubrey about  
**Reuben John:** good.  
**Jonny Rosenberg:** that?  
**Matthew:** Yeah, we can let let me share the information with the guys first. Um and then yeah, we can run it past Aubrey. I think it's more relevant to Tyler. Um Tyler I think will be a lot more opinionated on it. So maybe it's something to pick up with them. Yeah.  
   
 

### Transcription ended after 00:43:01

*This editable transcript was computer generated and might contain errors. People can also change the text after it was created.*