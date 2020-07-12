---
layout: project
name: FourthTone Mandarin
slug: fourth-tone-mandarin
description: A subscription based Chinese learning platform.
npm: 
github: 
website: https://fourthtone.com
tags: [Javascript]
image: /assets/images/projects/fourthtone/fourth-tone.png
---
### FourthTone Mandarin
FourthTone Mandarin is a Chinese learning platform that provides level based content that aims to make learning Chinese easier and more enjoyable. Learning Chinese can be difficult and time consuming largely due to its writing system. In Chinese, words are made up of a characters. Some words match up to a single character where others are composed of many characters. Chinese contains no delimeters such as spaces to show where one word ends and another begins. All of this makes it quite chalenging to students.
Rather than students needing to waste time segmenting and looking up characters/words, FourthTone does the work for them. Students simply click on a character/word they don't know to view a popup with pronunciation and definition. They can also click more to see additional information such as how the character is written and how that character is used in sentences. Below is a video showing the basic functinality of FourthTone.  

{% include video.html src="/assets/images/projects/fourthtone/ft-basic.mp4" %}

### Learning System
In addition to making it easier to learn new words FourthTone also provides a learning system. Students can save new vocabulary words into one of their lists. The learning system will then remind them when to study and review all of their vocabulary.  
The learning system is based on the spaced repitition learning methodology. The general idea is that it takes people a few encounters with new words spread out over time before they are truly able to internalise them.  
After initially learning the word the student is reminded several times to review the word. Each review of the word comes after an increasing duration of time. For example the first review might be 12 hours after learning the word, then the second review 2 days after the first review, the third review 1 week after the second review, etc. If a student has difficulty with the word during the review then that word  will be reviewed again the next day and the delay to the subsequent review delay will be set based on the students stuggle with the word.

**Vocab Lists and Study Reminders:**
![vocab lists](/assets/images/projects/fourthtone/ft-study.png)

**Study Module:**
![vocab lists](/assets/images/projects/fourthtone/ft-study-module.png)


### Content
The platform provides two main types of content, articles and courses. 
Articles are stand alone. They are categories by level and topic allowing students to select articles suiting their abilities and interests.
Courses are comprised of lessons that build on top of each other. They provide a more structured approach by highlighting key vocabulary and grammar. The lessons gradually introduce students to more vocabulary and grammar as they progress.
Both Articles and Lessons also include audio recording so that students can work on the lestining as well.

### Level Assessment
For students coming in to the platform who are unsure of their level. They can take a HSK level assesment test. The test uses 30 questions to determine the students level. The questions are a combination of picking the correct definition for a character and completing a sentence by filling in the blank. 


## Freemium


## challenges
- CMS - inputing content
- setting up relations 
- chinese is a complicated language
- no segmentation due to white spaces
- can havemultiple meanings and pronunciations for a given character