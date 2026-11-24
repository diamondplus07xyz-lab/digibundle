# Raw CSV data processing script
import re
import json

raw_csv = """Product Title,Category,Links Count,Part 1 - Link,Part 1 - Label,Part 2 - Link,Part 2 - Label,Part 3 - Link,Part 3 - Label,Part 4 - Link,Part 4 - Label,Part 5 - Link,Part 5 - Label,Part 6 - Link,Part 6 - Label,Part 7 - Link,Part 7 - Label
1000+ Space Aesthetic Reels Bundle – Cinematic Space Videos for Reels & Shorts,Aesthetic Reels,1,https://drive.google.com/drive/folders/1Ykmi_mcwvChCkcL1hMtEdW6AJAW3reVU,Bundle Access Link,,,,,,,,,,,,
700+ AI Cats Reels Bundle – Cute Viral Cat Videos for Reels & Shorts,"AI Reels, Animals Reels",1,https://drive.google.com/drive/folders/1bnJYTUN-rVq1syfZ0gN_5OrYyshbe_Fw,Bundle Access Link,,,,,,,,,,,,
1000+ AI Dogs Reels Bundle – Viral Dog & Pet Videos for Reels & Shorts,"AI Reels, Animals Reels",1,https://drive.google.com/drive/folders/1VIrNbAvfy-iVRttNRKKdagAW8B1Q2fV_,Bundle Access Link,,,,,,,,,,,,
500+ Korean Girl Reels Bundle – Aesthetic Fashion & Lifestyle Videos,"Fashion Reels, Lifestyle Reels",1,https://drive.google.com/drive/folders/1Gsv266UM7MuF-fjWgpC2smKPvYmh1en_,Bundle Access Link,,,,,,,,,,,,
"1,400+ Hindi Motivational Reels Bundle – Premium 720p Videos","Mindset Reels, Motivation &amp;amp",1,https://drive.google.com/drive/folders/1XZ00wKCxPruEpTyDmRxtLzP3GxPG3N1W,Bundle Access Link,,,,,,,,,,,,
1000+ God Reels Bundle – Devotional & Spiritual Videos,Devotional Reels,1,https://drive.google.com/drive/folders/1zReKMy4EctgGD2MWsL6SS25qXhQwjlPq,Bundle Access Link,,,,,,,,,,,,
600+ AI Motivational Reels Bundle – Viral Motivation & Success Videos,"AI Reels, Motivation Reels",1,https://drive.google.com/drive/folders/1kj3D8LqbD-hMOVOD8i0yroA6o3HTdtpp?usp=sharing,Bundle Access Link,,,,,,,,,,,,
"3000+ Sigma Male Reels Bundle – Attitude, Discipline & Mindset Videos",Motivation Reels,1,https://drive.google.com/drive/folders/1yuIaelcfvKommBi5uD7WhRA8HBnt5KbH,Bundle Access Link,,,,,,,,,,,,
500+ Domo AI Reels Bundle – Viral AI Visuals for Reels & Shorts,AI Reels,1,https://drive.google.com/drive/folders/1tXuZA2NwHm5WvwAvddkzhsTUMn4nN4-C,Bundle Access Link,,,,,,,,,,,,
"1,200+ Emotional Reels Bundle – Premium 720p Videos","Aesthetic Reels, Emotional &amp;amp",1,https://drive.google.com/drive/folders/1ymqRm0p1P7v67HFeP6Y9ww4tqm7-WyVt,Bundle Access Link,,,,,,,,,,,,
3500+ Free Fire Reels Bundle – Gaming Clips & Edits for Reels & Shorts,Gaming Reels,1,https://drive.google.com/drive/folders/1o4MMXlLZ3XxKtovFDMGgT9v7sHiP6c1b,Bundle Access Link,,,,,,,,,,,,
2000+ PUBG BGMI Reels Bundle – Battle Clips & Gaming Edits,Gaming Reels,1,https://drive.google.com/drive/folders/10GYoFNhVUcJH0-uCTjV6gbQ9GUFqn1kT,Bundle Access Link,,,,,,,,,,,,
2000+ Clash Royale & Clash of Clans Reels Bundle – Mobile Gaming Clips & Edits,Gaming Reels,1,https://drive.google.com/drive/folders/1-bD8mfZ18M-78IWKsz-QpoY-1f52L_Yi,Bundle Access Link,,,,,,,,,,,,
3000+ Cute Cats Reels Bundle – Cute & Adorable Cat Videos,Animals Reels,1,https://drive.google.com/drive/folders/1FzX1JR3R7ue-5f32BBj4bnoGK9m8XjB_,Bundle Access Link,,,,,,,,,,,,
2500+ Aesthetic Couple Reels Bundle – Romantic Love & Couple Videos,"Aesthetic Reels, Relationship Reels",1,https://drive.google.com/drive/folders/19Keg7QTg-fPPnFr00_2xJy7Nb-dLqNNi,Bundle Access Link,,,,,,,,,,,,
3000+ Cycling Reels Bundle – Cycling & Outdoor Sports Videos,Sports Reels,1,https://drive.google.com/drive/folders/1MAYeihHGT85ZWXWqEdng6vPP5RCpvPfy,Bundle Access Link,,,,,,,,,,,,
2000+ Aesthetic Snow Reels Bundle – Winter Aesthetic & Snow Videos,"Aesthetic Reels, Nature Reels",1,https://drive.google.com/drive/folders/1wipbO6v0Pfi6EPt1JnNztsHECXi-GX7E,Bundle Access Link,,,,,,,,,,,,
"1200+ Aesthetic Trees Reels Bundle – Nature, Trees & Green Aesthetic Videos","Aesthetic Reels, Nature Reels",1,https://drive.google.com/drive/folders/1TXgXXFJm-9ptbeICP6cfwZu6p0HdaGV-,Bundle Access Link,,,,,,,,,,,,
"1500+ Aesthetic Rain Reels Bundle – Rain, Mood & Relaxing Aesthetic Videos","Aesthetic Reels, Nature Reels",1,https://drive.google.com/drive/folders/14i0HoZUv1oe38NNiPmt8lBRem037dCbO,Bundle Access Link,,,,,,,,,,,,
"2000+ Ocean Sunset Cloud Reels Bundle – Ocean, Sunset & Cloud Aesthetic Videos","Aesthetic Reels, Nature Reels",1,https://drive.google.com/drive/folders/16EcQQ0-T8VlqN3Oz4yLUzYzHWFxHZYhD,Bundle Access Link,,,,,,,,,,,,
"2500+ Stoic Mindset Reels Bundle – Stoicism, Wisdom & Mindset Videos",Motivation Reels,1,https://drive.google.com/drive/folders/109C355WAq_1FFadGL66ipVYZOg8IoQUS,Bundle Access Link,,,,,,,,,,,,
3000+ Relatable Reels Bundle – Everyday Relatable & Viral Videos,Entertainment Reels,1,https://drive.google.com/drive/folders/1Or4h2L72G85tsYC8SCJgLxTXgN3pOy2L,Bundle Access Link,,,,,,,,,,,,
"3500+ Adult Talks Reels Bundle – Conversation, Life & Relationship Videos",Relationship Reels,1,https://drive.google.com/drive/folders/1Q8ey_u913UoxNAjcAQ_bqcqUYkT-NdrK,Bundle Access Link,,,,,,,,,,,,
200+ Long Movie Clips Reels Bundle – Cinematic Movie Scenes & Story Clips,Movie Reels,1,https://drive.google.com/drive/folders/1pqAW8ayU14D57AQuVlwlsQR6MEo86ndV,Bundle Access Link,,,,,,,,,,,,
500+ Superhero Reels Bundle – Action & Superhero Videos for Reels,Fantasy Reels,1,https://drive.google.com/drive/folders/13FHnU5c-OBbf1PbJoX_ecLKi9RXVKi34,Bundle Access Link,,,,,,,,,,,,
"4500+ Billionaire Lifestyle Reels Bundle – Luxury, Wealth & Success Lifestyle Videos","Lifestyle Reels, Luxury Reels",1,https://drive.google.com/drive/folders/1a05WsTVABvi8r5gcCcgfA9Fx-88DseMc,Bundle Access Link,,,,,,,,,,,,
3000+ Retro Bollywood Reels Bundle – Classic Bollywood Music & Movie Edits,Movie Reels,1,https://drive.google.com/drive/folders/1pNpYCJI2VkgwlYcS1Hru5vBb5E1Ho9zM,Bundle Access Link,,,,,,,,,,,,
"1100+ Mythical Reels Bundle – Fantasy, Mythical & Magical Story Videos",Fantasy Reels,1,https://drive.google.com/drive/folders/1zTU283ItPP2_rsXZW-qhu-d-vg5ACJal,Bundle Access Link,,,,,,,,,,,,
4500+ Mafia Cars Reels Bundle – Luxury Car & Mafia-Style Edits,"Cars Reels, Luxury Reels",1,https://drive.google.com/drive/folders/1SJ8-JFS-kCC58nPL8-CqL1xsi3ATrwGa,Bundle Access Link,,,,,,,,,,,,
5500+ Funny Fails Reels Bundle – Funny Fails & Viral Comedy Clips,Comedy Reels,1,https://drive.google.com/drive/folders/1eFbpXREAMtzb4YyLKdZ9s4tx4MrH9w7l,Bundle Access Link,,,,,,,,,,,,
2000+ Stop Scrolling Reels Bundle – Scroll-Stopping Viral Videos & Hooks,Entertainment Reels,1,https://drive.google.com/drive/folders/1As8EsNnBFVbU3VPU4F6A5UHI4U77Dm0Y,Bundle Access Link,,,,,,,,,,,,
"2000+ Faceless AI Tech Reels Bundle – AI, Technology & Future-Tech Videos",AI Reels,1,https://drive.google.com/drive/folders/1QihzRWsY3AupO4suLSDp1VOQIKfb3hXm,Bundle Access Link,,,,,,,,,,,,
800+ AI Story Reels Bundle – Cinematic AI Fantasy Story Videos,"AI Reels, Fantasy Reels, Story Reels",1,https://drive.google.com/drive/folders/1_9Bc62KBfWmEwAqqCSy3m93zDXaSMRAz,Bundle Access Link,,,,,,,,,,,,
"2500+ Runway Models Reels Bundle – Fashion, Runway & Model Videos","Fashion Reels, Model Reels",1,https://drive.google.com/drive/folders/10PTEaF19fN1FeCtD88KKsvOH7G06kEz3,Bundle Access Link,,,,,,,,,,,,
5000+ AI Funny Reels Bundle – Viral AI Comedy & Funny Videos,"AI Reels, Comedy Reels",1,https://drive.google.com/drive/folders/1RW0s9SkE-yctXnzP88p8NKxGBF9u2hC4,Bundle Access Link,,,,,,,,,,,,
1000+ Premanand Ji Maharaj Reels Bundle – Spiritual & Devotional Short Videos,Devotional Reels,1,https://drive.google.com/drive/folders/1K6aLaTQteuVbkETjMNSu-qTBcKNauvty,Main Bundle Folder,,,,,,,,,,,,
3000+ Cringe Reels Bundle – Funny Reaction & Cringe Videos,Comedy Reels,1,https://drive.google.com/drive/folders/1_9pvf_-cGy-o73_uUpf_9bszLuHMZGDY,Bundle Access Link,,,,,,,,,,,,
3500+ Funny Comments Reels Bundle – Funny Comment & Reaction Videos,Comedy Reels,1,https://drive.google.com/drive/folders/1n5Kmptz2Xsy58yJmtYCDxZUMcvAMmCGj,Bundle Access Link,,,,,,,,,,,,
3000+ Camera Tips Reels Bundle – Photography & Camera Tips Videos,Education Reels,1,https://drive.google.com/drive/folders/1URrxhfqB5Uj7oAtx38iFEKFmmqSmg32q,Bundle Access Link,,,,,,,,,,,,
"2600+ Dosti Friendship Reels Bundle – Friendship, Dosti & Bond Videos",Relationship Reels,1,https://drive.google.com/drive/folders/17RWTBSDlYDOPAgc74bYYcsrVXB0l_7oO,Bundle Access Link,,,,,,,,,,,,
"3000+ Dark Aesthetic Reels Bundle – Dark, Moody & Cinematic Aesthetic Videos",Aesthetic Reels,1,https://drive.google.com/drive/folders/1QOkJHMXKxOG833xPTHbk0Vxr-ng8OK2Y,Bundle Access Link,,,,,,,,,,,,
1200+ AI Glass Cutting ASMR Reels Bundle – Satisfying ASMR Videos for Reels & Shorts,AI Reels,1,https://drive.google.com/drive/folders/1zgV15R7qa6qPcY7upFQ6qngLXKzYlyQZ,Main Bundle Folder,,,,,,,,,,,,
250+ Baby Food Eating Reels Bundle – Cute Baby Food & Eating Videos,Baby Reels,0,,,,,,,,,,,,,,
1500+ AI Funny Kids Reels Bundle – Funny Kids & Baby Videos for Reels,"AI Reels, Kids Reels",1,https://drive.google.com/drive/folders/1of_cQj0SqyJcdozmHAvEr05NlllYxVEc,Main Bundle Folder,,,,,,,,,,,,
"450+ AI Health Awareness Reels Bundle – Health, Wellness & Nutrition Videos","AI Reels, Health Reels",2,https://drive.google.com/drive/folders/1Mu-5JCOzb_mRlmS8I5CHvNV1RBm6iZ4c,Hindi,https://drive.google.com/drive/folders/1MAMvEz0yxaN7jPwo2W0WXPii9cvIheoo,English,,,,,,,,,,
"10000+ Hot Girls Reels Bundle – Glamour, Fashion & Aesthetic Videos","Fashion Reels, Model Reels",3,https://drive.google.com/drive/folders/1DaIU_BeG5NCj6TfbxABFT_ORhJRcjAid,10K Hot Girls,https://drive.google.com/drive/folders/1W1YFZcZLHOYoKcj3BCC_EAmD-bZvodgY,13K Hot Girls,https://drive.google.com/drive/folders/1Gsv266UM7MuF-fjWgpC2smKPvYmh1en_,Bonus,,,,,,,,
500+ AI Influencer Girls Reels Bundle – Virtual Influencer & AI Girl Videos,"AI Reels, Influencer Reels",1,https://drive.google.com/drive/folders/1u_rKqdkS6Znyce33vqqBaDJ6A6ov5XWk?usp=sharing,Download,,,,,,,,,,,,
1000+ Hot Webseries Reels Bundle – Web Series Clips for Reels & Shorts,Entertainment Reels,1,https://drive.google.com/drive/folders/17ua0IomCH1ot8D1nlO3kNSGw-NzvUTC1?usp=sharing,Main Bundle Folder,,,,,,,,,,,,
1500+ Mad Scientist Reels Bundle – AI Story & Pookie Voice Videos,"AI Reels, Story Reels",3,https://drive.google.com/drive/folders/1CVdhGLvj8P3eyylSjtVmYEXn0txZ5twd,Google Drive Access 1,https://drive.google.com/file/d/17F_YmtRkq4646shpKMD26NIOA6t9RUMm/view?usp=drivesdk,Google Drive Access 2,https://drive.google.com/drive/folders/1QL5eD7IgtgnD_IzHY1qyyo44b3144TJL,Google Drive Access 3,,,,,,,,
500+ AI Baby Dancing Reels Bundle – Cute Viral Baby Dance Videos,"AI Reels, Baby Reels",2,https://drive.google.com/drive/folders/1D-FsxjxkDAZ2-De3X7ovnNlrB5MPZV0f,200 AI Baby Dancing Reels – Google Drive Access,https://drive.google.com/drive/folders/1GK7w1rKW974ayMWaXG5Vl0tAGhrm_mhJ,300 AI Baby Dancing Reels – Google Drive Access,,,,,,,,,,
500+ AI Hulk Story Reels Bundle – AI Action & Superhero Story Videos,"AI Reels, Fantasy Reels, Story Reels",1,https://drive.google.com/drive/folders/1Z2CwE7IuC15fIieUqtAv0h6-1zrCtLUD,AI Hulk Story Reels – Google Drive Access,,,,,,,,,,,,
1500+ AI Glowing Motion Graphics Reels Bundle – Neon Motion Graphics & Visual Loops,"AI Reels, Animation Reels",2,https://drive.google.com/drive/folders/1BhSfthOy9i0K5z-BLDW53v1xAR_nnrKP?usp=drive_link,Motion Glowing,https://drive.google.com/drive/folders/1-aE5LXg2OEZvV4r-uT1wghPkeEDSa-3K,Motion Animation,,,,,,,,,,
600+ Viral Chibi Style Reels Bundle – Cute Chibi Anime & Cartoon Videos,Anime Reels,1,https://drive.google.com/drive/folders/1saR2zoFd47npssYG0PnUeY8HMD5Zky5o,Google Drive,,,,,,,,,,,,
1000+ Animated Gym Workout Reels Bundle – Animated Fitness & Workout Videos,"Animation Reels, Fitness Reels",1,https://drive.google.com/drive/folders/1vBx4tzfMJGCUNlg-78YMbbq6qCqr6CQF,Main Bundle Folder,,,,,,,,,,,,
500+ AI Miniature Reels Bundle – Tiny Workers & Miniature World Videos,"AI Reels, Entertainment Reels",1,https://mega.nz/folder/CBERSKwa#pI4Sxxrk091xYXFNIxe-CA,Main Bundle Folder,,,,,,,,,,,,
600+ AI Animal Reels Bundle – Cute Viral Animal Videos,"AI Reels, Animals Reels",1,https://mega.nz/folder/PQFiUSiD#rT7w4RzI9yzFGoBrcvUCCQ,Main Bundle Folder,,,,,,,,,,,,
1000+ AI Story Reels Bundle – Viral AI Story Videos for Social Media,"AI Reels, Story Reels",1,https://drive.google.com/drive/folders/1G377wwyyilxxaBuDamJZsnR2j8emleN5,Main Bundle Folder,,,,,,,,,,,,
600+ AI Tiny Dancers Reels Bundle – Magical Tiny Dancing Videos,"AI Reels, Entertainment Reels",1,https://drive.google.com/drive/folders/1o_O5sBBhML79QKJOagwUmlp-6qWk5dFp?usp=sharing,Main Bundle Folder,,,,,,,,,,,,
AI Hindi Story Reels Bundle – 1-Minute Hindi Kahani & Story Videos,"AI Reels, Story Reels",1,https://drive.google.com/drive/folders/1lbPsLSl_18aMRjS0l3aJXka5in9jhDLe?usp=sharing,Main Bundle Folder,,,,,,,,,,,,
500+ AI Monkey Vlogging Reels Bundle – Funny AI Monkey Vlog Videos,"AI Reels, Animals Reels",1,https://drive.google.com/drive/folders/1XJJb-JvApUfR5mVlssZrzC36B1p8ltaU,Main Bundle Folder,,,,,,,,,,,,
"9000+ Art & Craft Reels Bundle – DIY Art, Craft & Creative Videos",DIY Reels,7,https://drive.google.com/drive/folders/1uvX4I50ffSWSI4I0391SHuMA87ap8MEL?usp=share_link,Main Bundle Folder,https://drive.google.com/drive/folders/1qu2D1SPkxpvi02-so_yFPLX_FlVnghxg?usp=share_link,Google Drive,https://drive.google.com/drive/folders/1G5xbXT5629Kcc1f1jm4Z9CElHCcwvzKN?usp=share_link,Google Drive,https://drive.google.com/drive/folders/1anralA1EiyQoYaya6rBv04WauHTvgS39?usp=share_link,Google Drive,https://drive.google.com/drive/folders/1vN0PSN3ieAxBVSE_HSBM1sRv5XUT137Z?usp=share_link,Google Drive,https://drive.google.com/drive/folders/1wFHnCLNJweI4eKGwSlBwzLyzEWEJCN_F?usp=share_link,Google Drive,https://drive.google.com/drive/folders/1esdF1GN0C-WAlEsvJDgHEah00w-wz0Bw?usp=share_link,Google Drive
600+ Ghibli Style Reels Bundle – Anime-Inspired Story & Aesthetic Videos,"Anime Reels, Story Reels",1,https://drive.google.com/drive/folders/1saR2zoFd47npssYG0PnUeY8HMD5Zky5o,Main Bundle Folder,,,,,,,,,,,,
600+ AI Baby Podcast Bundle – Cute Viral Baby Podcast Videos,"AI Reels, Baby Reels",3,https://drive.google.com/drive/folders/13sRBc7fYdv5POO4Gh4SOJJBLacrFXazA,Main Bundle Folder,https://drive.google.com/drive/folders/1sWyQL9-imTEm8-LNBfBGNu1t79AI0vMR,Google Drive,https://drive.google.com/drive/folders/1Br7gIYEo_NwT_mC2MKWUTJUQjGKLd0P-,Google Drive,,,,,,,,
500+ Viral AI Celebrity Reels Bundle – Trending Celebrity-Style Videos,"AI Reels, Celebrity Reels",1,https://drive.google.com/drive/folders/1szhIza2r97vuxXg8T_fEASUte-BDKrc0,Main Bundle Folder,,,,,,,,,,,,
200+ AI Patal Lok Narkh Yamraj Reels – Mythic Yamraj & Patal Lok Story Videos,"AI Reels, Fantasy Reels, Story Reels",1,https://drive.google.com/drive/folders/1sR-kTocZYa70fDAlt1nri1sLSVVbCoEw,Main Bundle Folder,,,,,,,,,,,,
500+ AI Anime Girl Aesthetic Lifestyle Reels – Cozy Anime Girl Lifestyle Videos,"Anime Reels, Lifestyle Reels",1,https://drive.google.com/drive/folders/1GotSOpN8Wg82R0gkxn_ZXc6KbDuk7ANa?usp=drive_link,Main Bundle Folder,,,,,,,,,,,,
5000+ Trending AI Anime Reels Bundle – Viral Anime & Animated Short Videos,"AI Reels, Anime Reels",1,https://drive.google.com/drive/folders/1xJE-N3Oi3VCCMmke82obnC1HQwp3615k,Main Bundle Folder,,,,,,,,,,,,
800+ AI Horror Reels Bundle – Scary Cinematic Horror Videos,"AI Reels, Horror Reels",1,https://drive.google.com/drive/folders/1UqLiv-4GDWsef3_VuAkf3misrI9vd4tT,Main Bundle Folder,,,,,,,,,,,,
1000+ AI Dog Reels Bundle – Cute Viral Dog Videos for Reels & Shorts,"AI Reels, Animals Reels",1,https://drive.google.com/drive/folders/1pzrBTYK_rbJwxSK2RTVjC9u6OKjHTH3Z,Main Bundle Folder,,,,,,,,,,,,
3200+ Ultimate Twisted World Reel Bundle – Fantasy Creature & Twisted World Stories,"AI Reels, Fantasy Reels, Story Reels",2,https://drive.google.com/drive/folders/1zUBkXWAQozA4f28W8AhhFKpg94qLVw3F?usp=sharing,Main Bundle Folder,https://drive.google.com/drive/folders/1CksKkU1ERAuhD9hgBZNP7xP9g068mG-c?usp=sharing,Google Drive,,,,,,,,,,
2000+ Viral AI Influencer Reel Bundle – Trending AI Influencer-Style Content,"AI Reels, Influencer Reels",0,,,,,,,,,,,,,,
5000+ AI Funny Story Reels Bundle – Viral AI Comedy Story Videos,"AI Reels, Comedy Reels, Story Reels",1,https://drive.google.com/drive/folders/1ruIFMzQ7vNv2cm3nPV0AJv_xCcB16nL4,Main Bundle Folder,,,,,,,,,,,,
"9000+ Foreign Models Reels Bundle Pack – Fashion, Glamour & Model Videos",Model Reels,1,https://drive.google.com/drive/folders/1TIPCKgYu8iPnXgurqdzwBGfQlUGM2z8a,Main Bundle Folder,,,,,,,,,,,,
500+ AI Indian Glamour Model Reels Bundle – Stylish AI Indian Glamour Videos,"AI Reels, Model Reels",1,https://drive.google.com/drive/folders/1TSbXdYIXyC_ifUhqWNUKvvaY-T0UU2yI?usp=drive_link,Download,,,,,,,,,,,,
500+ Dr Skeleton Health Reels Bundle – Health Awareness & Medical Story Videos,"AI Reels, Health Reels",0,,,,,,,,,,,,,,
500+ Hot Anushka Sen AI Reels Bundle – Celebrity-Style Fashion & Lifestyle Videos,"AI Reels, Celebrity Reels",1,https://drive.google.com/drive/u/0/folders/1Y2aHFLb7TlYMwH1EwKPjYZOSa5cqs0Ao,Main Bundle Folder,,,,,,,,,,,,
AI 3D Cartoon Reels Bundle – Viral 3D Cartoon Story Videos,"AI Reels, Animation Reels, Story Reels",1,https://drive.google.com/drive/folders/1W4-qvHY3eVqBzT6EDm6CJmP5ENDdSVBh?usp=drive_link,Main Bundle Folder,,,,,,,,,,,,
1000+ Ulti Pulti Duniya / Ulti Duniya / Reverse World AI Reels Bundle,"AI Reels, Animals Reels, Comedy Reels, Story Reels",2,https://drive.google.com/drive/folders/1zUBkXWAQozA4f28W8AhhFKpg94qLVw3F?usp=sharing,500,https://drive.google.com/drive/folders/1CksKkU1ERAuhD9hgBZNP7xP9g068mG-c?usp=sharing,500,,,,,,,,,,
500+ Snake Ulti Duniya AI Reels Bundle – Saamp Ki Ulti Duniya / Reverse World Videos,"AI Reels, Animals Reels, Comedy Reels, Story Reels",1,https://drive.google.com/drive/folders/1CksKkU1ERAuhD9hgBZNP7xP9g068mG-c?usp=sharing,Main Bundle Folder,,,,,,,,,,,,
"2000+ AI Typography Reels Bundle – Viral Text, Quotes & Kinetic Typography Videos","AI Reels, Motivation Reels",0,,,,,,,,,,,,,,
2500+ Stickman Animation Reels Bundle – Funny Viral Stick Figure Videos,"Animation Reels, Comedy Reels, Story Reels",1,https://drive.google.com/drive/folders/1yuOoZ2f7P3tdj8ubF_J-hLEkts0jXmW3,Main Bundle Folder,,,,,,,,,,,,
1000+ Rust Restoration Reels Bundle – Satisfying Before & After Videos,"DIY Reels, Entertainment Reels",0,,,,,,,,,,,,,,
2000+ USA Horror Story Reels Bundle – Scary English Stories & Creepy Shorts,"Horror Reels, Story Reels",0,,,,,,,,,,,,,,
3000+ Roblox Game Reels Bundle – Viral Gameplay Clips for Reels & Shorts,Gaming Reels,0,,,,,,,,,,,,,,
1100+ Mini Vehicle Assembly Reels Bundle – Satisfying Mini Car Build Videos,"Cars Reels, DIY Reels",0,,,,,,,,,,,,,,
"850+ Timelapse Reels Bundle – City, Nature, Travel & Sky Videos","Aesthetic Reels, Nature Reels",0,,,,,,,,,,,,,,
2000+ GTA V Gameplay Reels Bundle – Viral Gaming Clips & Action Shorts,Gaming Reels,0,,,,,,,,,,,,,,
5000+ USA Cartoon Videos Bundle – English Kids 2D & 3D Animated Stories,"Animation Reels, Kids Reels, Story Reels",1,https://drive.google.com/drive/folders/1F_WfvwkakHLd1E06LC5cbdHb23U7hpfx,Main Bundle Folder,,,,,,,,,,,,
1250+ AI Floor Transformation Reels Bundle – Satisfying Flooring Makeover Videos,"AI Reels, DIY Reels",0,,,,,,,,,,,,,,
750+ AI Unreality Reels Bundle,"AI Reels, Entertainment Reels, Story Reels",0,,,,,,,,,,,,,,
650+ Soft Body Animation Reels Bundle,"AI Reels, Animation Reels, Satisfying Reels",0,,,,,,,,,,,,,,
2000+ AI Talking Objects Reels Bundle,"AI Reels, Comedy Reels, Entertainment Reels",0,,,,,,,,,,,,,,
2100+ AI Food Drama Story Reels Bundle,"AI Reels, Comedy Reels, Food Reels, Story Reels",0,,,,,,,,,,,,,,
400+ AI Abandoned Places Reels Bundle,"Aesthetic Reels, AI Reels, Horror Reels",0,,,,,,,,,,,,,,
1000+ AI Caught on Camera Reels Bundle,"AI Reels, Entertainment Reels, Viral Reels",0,,,,,,,,,,,,,,
450+ AI Japanese Horror Reels Bundle,"AI Reels, Horror Reels, Story Reels",0,,,,,,,,,,,,,,
300+ Dream Bed AI ASMR Reels Bundle,"Aesthetic Reels, AI Reels, ASMR Reels",0,,,,,,,,,,,,,,
700+ Cute AI Monster Reels Bundle,"AI Reels, Entertainment Reels, Kids Reels",0,,,,,,,,,,,,,,
2500+ Scary Job Reels Bundle,"Entertainment Reels, Horror Reels, Story Reels",0,,,,,,,,,,,,,,
1400+ Amazon Jungle AI Reels Bundle,"AI Reels, Animals Reels, Nature Reels, Story Reels",0,,,,,,,,,,,,,,
400+ AI Massage Spa Reels Bundle,"AI Reels, Beauty Reels, Business Reels, Wellness Reels",0,,,,,,,,,,,,,,
200+ Futuristic AI Machine Reels Bundle,"AI Reels, Cars Reels, Machine Reels, Tech Reels",0,,,,,,,,,,,,,,
350+ AI Facts Reels Bundle,"AI Reels, Education Reels, Facts Reels, Knowledge Reels",0,,,,,,,,,,,,,,
500+ Mini Car Unboxing Reels Bundle,"ASMR Reels, Car Reels, Collectibles Reels, Unboxing Reels",0,,,,,,,,,,,,,,
500+ Indian Cricket Reels Bundle – Premium 720p Videos,Sports Reels,1,https://drive.google.com/drive/folders/19ZOdWVrqXqH3G_RGIVDKIQ_THtAv3zao,Bundle Access Link,,,,,,,,,,,,
500+ AI Fitness Reels Bundle – Premium 720p Videos,"AI Reels, Fitness Reels",1,https://drive.google.com/drive/folders/17TZxcANBRfCZQL0G0ZUnIeQ2FyVElq6A,Bundle Access Link,,,,,,,,,,,,
500+ AI Tech Reels Bundle – Premium 720p Videos,"AI Reels, Tech Reels",1,https://drive.google.com/drive/folders/1YKqZJe120qfeXoGIflkgjRC8z4-pdVks,Bundle Access Link,,,,,,,,,,,,
500+ AI Health Reels Bundle – Premium 720p Videos,"AI Reels, Health Reels",1,https://drive.google.com/drive/folders/1nt5d6bKEApAr2PXI8FzcRGTlpKN6ZTRz,Bundle Access Link,,,,,,,,,,,,
"1,000+ Art & Craft Reels Bundle – Premium 720p Videos","Art &amp;amp, Craft Reels",1,https://drive.google.com/drive/folders/1_ZOSrPjtftLH7zA3vQkPR8eCOuApUSzk,Bundle Access Link,,,,,,,,,,,,
"1,000+ Business Growth Motivational Reels Bundle – Premium 720p Videos","Business Reels, Mindset Reels, Motivation &amp;amp",1,https://drive.google.com/drive/folders/1mrPzK5Zz9ZbEk6rUDQSRYb52UHG4dsaf,Bundle Access Link,,,,,,,,,,,,
"3,000+ Mega Car Reels Bundle – Premium 720p Videos","Cars &amp;amp, Lifestyle Reels",1,https://drive.google.com/drive/folders/1xyepyNXc_j_ThL0A_vzfqTek5g4BRKJm,Bundle Access Link,,,,,,,,,,,,
"2,200+ Gym & Fitness Reels Bundle – Premium 720p Videos",Fitness Reels,1,https://drive.google.com/drive/folders/1n9s_PYqWku13IDw1SwlsnVmH5rfXR_A8,Bundle Access Link,,,,,,,,,,,,
"1,000+ Universe Reels Bundle – Premium 720p Videos","Aesthetic Reels, Space &amp;amp",1,https://drive.google.com/drive/folders/1ILhXC3Ey7EPlGBW-ZfCdPXRc7Su5Wl0x,Bundle Access Link,,,,,,,,,,,,
1200+ AI Interior Design Reels Bundle,"AI Reels, Home Decor Reels, Interior Design Reels",0,,,,,,,,,,,,,,
2000+ Luxury Hotels & Resorts Reels Bundle,"Luxury Lifestyle Reels, Resort Reels, Travel Reels",0,,,,,,,,,,,,,,
1500+ Behind the Scenes AI Reels Bundle,"AI Reels, Behind The Scenes Reels, Creator Reels",0,,,,,,,,,,,,,,
1000+ Unique Products Reels Bundle,"Business Reels, Gadgets Reels, Product Reels",0,,,,,,,,,,,,,,
900+ Childhood Nostalgia Reels Bundle,"Emotional Reels, Entertainment Reels, Nostalgia Reels",0,,,,,,,,,,,,,,
1000+ Skeleton Quotes Reels Bundle,"Dark Aesthetic Reels, Entertainment Reels, Quotes Reels",0,,,,,,,,,,,,,,
600+ Place Restoration AI Reels Bundle,"AI Reels, Restoration Reels, Transformation Reels",0,,,,,,,,,,,,,,
1500+ Motherhood Reels Bundle,"Emotional Reels, Family Reels, Kids &amp;amp, Motherhood Reels",0,,,,,,,,,,,,,,
"1,000+ Nature Reels Bundle – Premium 720p Videos","Aesthetic Reels, Nature &amp;amp",1,https://drive.google.com/drive/folders/1C01i82juFKh7IvP42VhRwDz4PVcMsbRl,Bundle Access Link,,,,,,,,,,,,
500+ Sanatan Dharm Reels Bundle – Premium 720p Videos,"Religious Reels, Spiritual &amp;amp",1,https://drive.google.com/drive/folders/1awCPTpgpRAYdh7pDs6P5CvLeIG-HCyrl,Bundle Access Link,,,,,,,,,,,,
500+ AI Islamic Reels Bundle – Premium 720p Videos,"AI Reels, Religious Reels, Spiritual &amp;amp",1,https://drive.google.com/drive/folders/1XfuZBqpSPGmMVwM4TUPn3dzUdW-T3PuC,Bundle Access Link,,,,,,,,,,,,
500+ Car & Luxury Reels Bundle – Premium 720p Videos,"Cars &amp;amp, Lifestyle Reels",1,https://drive.google.com/drive/folders/1hpwetf4zqIs1Yt0R0g8dBREDJ_oN61oW,Bundle Access Link,,,,,,,,,,,,
500+ Zig & Sharko Cartoon Reels Bundle – Premium 720p Videos,"Animation Reels, Cartoon &amp;amp",1,https://drive.google.com/drive/folders/1sDrsT8RnCKR6uLR3oczZmAlT3jwAAoYW,Bundle Access Link,,,,,,,,,,,,
"2,500+ Tools Reels Bundle – Premium 720p Videos","DIY Reels, Tools &amp;amp",1,https://drive.google.com/drive/folders/1_JDuQqRyk5hDe6JiTVHwRx3c51BtHWQu,Bundle Access Link,,,,,,,,,,,,
500+ Satisfying Reels Bundle – Premium 720p Videos,"ASMR Reels, Satisfying &amp;amp",1,https://drive.google.com/drive/folders/1jzhyjsiKPRWJSZZSsasz4qq8Kq9qapV5,Bundle Access Link,,,,,,,,,,,,
500+ Tools Tips Reels Bundle – Premium 720p Videos,"DIY Reels, Tools &amp;amp",1,https://drive.google.com/drive/folders/1V43pBAdaa4Xhtzvc5blXkeYMDr7RSa7l,Bundle Access Link,,,,,,,,,,,,
"1,000+ Woodwork Reels Bundle – Premium 720p Videos","Craft Reels, DIY &amp;amp",1,https://drive.google.com/drive/folders/1J7byJvBRrULtgysJ9eeXF7pWWtISxsIU,Bundle Access Link,,,,,,,,,,,,
500+ Paper Art Reels Bundle – Premium 720p Videos,"Art &amp;amp, Craft Reels",1,https://drive.google.com/drive/folders/1HI2Q3zmom9MkblsgdgT-9sjjtFp5jDY3,Bundle Access Link,,,,,,,,,,,,
500+ Anime Reels Bundle – Premium 720p Videos,"Animation Reels, Cartoon &amp;amp",1,https://drive.google.com/drive/folders/1xJE-N3Oi3VCCMmke82obnC1HQwp3615k,Bundle Access Link,,,,,,,,,,,,
500+ Trending Reels Bundle – Premium 720p Videos,Trending Reels,1,https://drive.google.com/drive/folders/1U-hv1MG7Uh_ZXMcqsC48EXLSMkkcU2qU,Bundle Access Link,,,,,,,,,,,,
500+ Athletic Reels Bundle – Premium 720p Videos,"Fitness Reels, Sports &amp;amp",1,https://drive.google.com/drive/folders/1abXzzLDuRm_WGrwGz-Zh5O798-JKvJAd,Bundle Access Link,,,,,,,,,,,,
500+ Stock Market Reels Bundle – Premium 720p Videos,"Business &amp;amp, Finance Reels",1,https://drive.google.com/drive/folders/193sV7W9KGkZPVkVbs4rjFmHEu5Is8qZV,Bundle Access Link,,,,,,,,,,,,
100+ Attitude Reels Bundle – Premium 720p Videos,"Attitude Reels, Lifestyle &amp;amp",1,https://drive.google.com/drive/folders/1dsXbUDAfyBsCRd7dRP4G530OZBnA14pU,Bundle Access Link,,,,,,,,,,,,
500+ Business Tips Reels Bundle – Premium 720p Videos,"Business &amp;amp, Finance Reels",1,https://drive.google.com/drive/folders/19OihxyPDGIludrkNUL-G35tqdY_607tM,Bundle Access Link,,,,,,,,,,,,
500+ Craft Reels Bundle – Premium 720p Videos,"Art &amp;amp, Craft Reels",1,https://drive.google.com/drive/folders/1_Q5PqpgLgqMHBarzNVsv_JHA_iC_P0qb,Bundle Access Link,,,,,,,,,,,,
100+ Football Reels Bundle – Premium 720p Videos,Sports Reels,1,https://drive.google.com/file/d/1aK2d_F0awcE8kMAnOLozLxzXwPvxpqFL/view,Bundle Access Link,,,,,,,,,,,,
"3,100+ Mega Anime Reels Bundle – Premium 720p Videos","Animation Reels, Cartoon &amp;amp",1,https://drive.google.com/drive/folders/1vAkSCfTcXPen5pDkwMgUmbAOqGQZxfwF,Bundle Access Link,,,,,,,,,,,,
"1,100+ AI Story Chats Reels Bundle",AI Story Reels,1,https://drive.google.com/drive/folders/1hJVNPA3gfW7eBQV8d8jIlBnd58vPeEdi,Bundle Access Link,,,,,,,,,,,,
"3,500+ Travel & Tourism Reels Bundle",Travel Reels,1,https://drive.google.com/drive/folders/1JRQJT6nav8ck4Io20evLRZye3X5bwwbr,Bundle Access Link,,,,,,,,,,,,
"3,100+ Podcast Reels Bundle",Podcast Reels,1,https://drive.google.com/drive/folders/1SS373xT-XsdvYf21Gd8taTWBLPksq3lt,Bundle Access Link,,,,,,,,,,,,
"1,500+ F1 Cars Reels Bundle",Sports Reels,1,https://drive.google.com/drive/folders/18H9J4dQM9RYqypGHNo3SJcXwmhaIQRtx,Bundle Access Link,,,,,,,,,,,,
"3,500+ Magic Tricks Reels Bundle",Entertainment Reels,1,https://drive.google.com/drive/folders/1p8xVvq6PR9VgDgrzfmEd9z32R4bye7ym,Bundle Access Link,,,,,,,,,,,,
600+ Arpit Bala Reels Bundle,Comedy Reels,1,https://drive.google.com/drive/folders/1r8ovSI42eWdAcvNwMqOOq7x6rMnvh6p5,Bundle Access Link,,,,,,,,,,,,
600+ Humanity & Kindness Reels Bundle,Inspirational Reels,1,https://drive.google.com/drive/folders/1CBvANc9GOwSbCri3DL-y_GVWFBp3q0C9,Bundle Access Link,,,,,,,,,,,,
"1,500+ Girl Dancing Reels Bundle",Dance Reels,1,https://drive.google.com/drive/folders/15Pp0qQiJGYZqfZr4J2J-DFs0BPQ-Lzbh,Bundle Access Link,,,,,,,,,,,,
"3,000+ Basketball Reels Bundle",Sports Reels,1,https://drive.google.com/drive/folders/112l3L-WD0ji90I1BRc7yedn4Y4dpWWU4,Bundle Access Link,,,,,,,,,,,,
"1,500+ Women Fitness Reels Bundle",Fitness Reels,1,https://drive.google.com/drive/folders/1wO80Fsj5oKn4uUutgCdnJO2aMGVhscJT,Bundle Access Link,,,,,,,,,,,,
"2,500+ Gym Tips Reels Bundle",Fitness Reels,1,https://drive.google.com/drive/folders/1-WHmvzyZMcZih1FuwQzPG9hSWoC9AYF5,Bundle Access Link,,,,,,,,,,,,
"1,500+ AI Models Reels Bundle",AI Reels,1,https://drive.google.com/drive/folders/1DAqZZxw2PO8MHCsysTayNNaUurV0vz0s,Bundle Access Link,,,,,,,,,,,,
"3,000+ Calisthenics Reels Bundle",Fitness Reels,1,https://drive.google.com/drive/folders/1uM9O1q1pMTR7NnxKaoSDzh-fMDy1dpiW,Bundle Access Link,,,,,,,,,,,,
"3,000+ Valorant Reels Bundle",Gaming Reels,1,https://drive.google.com/drive/folders/129_QHHY58bk0QSyXSyZYL02gMSoAbb4R,Bundle Access Link,,,,,,,,,,,,
"1,500+ Aesthetic Girls Reels Bundle",Aesthetic Reels,1,https://drive.google.com/drive/folders/13VgKgjRmMZbfXoHDEp7oR3s4M4GnTyp6,Bundle Access Link,,,,,,,,,,,,
"2,200+ High Testosterone Reels Bundle",Fitness Reels,1,https://drive.google.com/drive/folders/1dVJW_jXWA-deq09xPOve3hThm6GeH9-J,Bundle Access Link,,,,,,,,,,,,
"2,000+ Fortnite Reels Bundle",Gaming Reels,1,https://drive.google.com/drive/folders/1nblaVctP_v1v0qcqlmggPPFY_iKfg9B4,Bundle Access Link,,,,,,,,,,,,
"2,500+ Trick Shots Reels Bundle",Sports Reels,1,https://drive.google.com/drive/folders/1fGo03pctv_Eg198z3_eptes0LXHK_Sr3,Bundle Access Link,,,,,,,,,,,,
"1,700+ Call of Duty Reels Bundle",Gaming Reels,1,https://drive.google.com/drive/folders/1JNU1nIqzTN3e2gw5d8x4Av9ZuCfb06tw,Bundle Access Link,,,,,,,,,,,,
"1,000+ Slowed Reels Bundle",Aesthetic Reels,1,https://drive.google.com/drive/folders/16T-xOwRrYpNXKsmFnoO16o_K5AE5YZcW,Bundle Access Link,,,,,,,,,,,,
2D Funny Animation Reels Bundle – Cartoon Comedy Videos,"Animation Reels, Comedy Reels",0,,,,,,,,,,,,,,
Product Title,Category,Access ID
250+ Baby Food Eating Reels Bundle – Cute Baby Food & Eating Videos,Baby Reels,ll3yyjothfvzyqezkls97jul4pc8yibc
2000+ Viral AI Influencer Reel Bundle – Trending AI Influencer-Style Content,"AI Reels, Influencer Reels",8yobdbiokbj7zctnfjgfbvytfo9mi0ib
500+ Dr Skeleton Health Reels Bundle – Health Awareness & Medical Story Videos,"AI Reels, Health Reels",xp2yznlfqmxdbyudq4qct6f1uhiozt4t
"2000+ AI Typography Reels Bundle – Viral Text, Quotes & Kinetic Typography Videos","AI Reels, Motivation Reels",bluavx7grvxapa1zml4knmy0cycdho2n
1000+ Rust Restoration Reels Bundle – Satisfying Before & After Videos,"DIY Reels, Entertainment Reels",kvv7zsxfetvzqzt2kp8hjti32b95i93a
2000+ USA Horror Story Reels Bundle – Scary English Stories & Creepy Shorts,"Horror Reels, Story Reels",pcuwdzqxyrwaskqqgsdidxz0aijceerm
3000+ Roblox Game Reels Bundle – Viral Gameplay Clips for Reels & Shorts,Gaming Reels,4kmnuxsyqnqhgox7bhehy5adb6w5ieyn
1100+ Mini Vehicle Assembly Reels Bundle – Satisfying Mini Car Build Videos,"Cars Reels, DIY Reels",2g98yztq17qgvv2w8l2mjobcjblhmw0d
"850+ Timelapse Reels Bundle – City, Nature, Travel & Sky Videos","Aesthetic Reels, Nature Reels",s1t7m910sag2hvhyrn3yrbfefri1lft0
2000+ GTA V Gameplay Reels Bundle – Viral Gaming Clips & Action Shorts,Gaming Reels,ncxgcxyp9zl4rlbsqymkumg9tr3exjyr
1250+ AI Floor Transformation Reels Bundle – Satisfying Flooring Makeover Videos,"AI Reels, DIY Reels",pzjenh9oaf1zqb7ijs83zxelxq2nxteb
750+ AI Unreality Reels Bundle,"AI Reels, Entertainment Reels, Story Reels",spgnao3arfcomimevgn86xdopo6swoal
650+ Soft Body Animation Reels Bundle,"AI Reels, Animation Reels, Satisfying Reels",wfxg9dss8kt8tqkvkrvljf1qirlfz1pk
2000+ AI Talking Objects Reels Bundle,"AI Reels, Comedy Reels, Entertainment Reels",1swnj639ljxgmmrx6ksz97stsfge96tn
2100+ AI Food Drama Story Reels Bundle,"AI Reels, Comedy Reels, Food Reels, Story Reels",cvbh3y2gg8waanftffpdnrbcvydzlmk2
400+ AI Abandoned Places Reels Bundle,"Aesthetic Reels, AI Reels, Horror Reels",2r40dxtdeqn0xhxyqyxlqtaeuzcywmjt
1000+ AI Caught on Camera Reels Bundle,"AI Reels, Entertainment Reels, Viral Reels",oars0golpnekgzsqipl56wtdrlyhaqkw
450+ AI Japanese Horror Reels Bundle,"AI Reels, Horror Reels, Story Reels",zqxervromknjdhcyhvynlquahznvrq7c
300+ Dream Bed AI ASMR Reels Bundle,"Aesthetic Reels, AI Reels, ASMR Reels",jp8dafigscscprzc3gjvefqhbyk1io2d
700+ Cute AI Monster Reels Bundle,"AI Reels, Entertainment Reels, Kids Reels",jhnh27wzshmzuivl2ui7mhduojkffrkp
2500+ Scary Job Reels Bundle,"Entertainment Reels, Horror Reels, Story Reels",vpki30l3hv8lcr4i38qszd7yzlxxaxfi
1400+ Amazon Jungle AI Reels Bundle,"AI Reels, Animals Reels, Nature Reels, Story Reels",j0fovqrdcmrgsel6mg9nhfzhj9qur4ra
400+ AI Massage Spa Reels Bundle,"AI Reels, Beauty Reels, Business Reels, Wellness Reels",rzvdtghfzcnr79vjvjv4ra4lvbxwjoix
200+ Futuristic AI Machine Reels Bundle,"AI Reels, Cars Reels, Machine Reels, Tech Reels",9mmu56uyxlfta83icm9wpdytkio4riwd
350+ AI Facts Reels Bundle,"AI Reels, Education Reels, Facts Reels, Knowledge Reels",txunaywyehsp4lq3bkocydfna8hdl47d
500+ Mini Car Unboxing Reels Bundle,"ASMR Reels, Car Reels, Collectibles Reels, Unboxing Reels",z4iexlvp7hvj4lhjw9lf4dt7dwhsmrw0
1200+ AI Interior Design Reels Bundle,"AI Reels, Home Decor Reels, Interior Design Reels",c2qhavd9pb0vmthznrvzswhtmm5jello
2000+ Luxury Hotels & Resorts Reels Bundle,"Luxury Lifestyle Reels, Resort Reels, Travel Reels",vknkudtyvhglxphwdtkki1biasmjemf1
1500+ Behind the Scenes AI Reels Bundle,"AI Reels, Behind The Scenes Reels, Creator Reels",apbyhs6qw8ltv7l7u4pmzk85cnxvhvvj
1000+ Unique Products Reels Bundle,"Business Reels, Gadgets Reels, Product Reels",9q4eihgex6bsrpysp9uftzda7jygvbhw
900+ Childhood Nostalgia Reels Bundle,"Emotional Reels, Entertainment Reels, Nostalgia Reels",jkconatnmaafp5enfjb4q1krccnpq1ys
1000+ Skeleton Quotes Reels Bundle,"Dark Aesthetic Reels, Entertainment Reels, Quotes Reels",fi7krzcgo7qeyqlvvnbugveplo4pfxlp
600+ Place Restoration AI Reels Bundle,"AI Reels, Restoration Reels, Transformation Reels",jtxdnwbh5he9oai6ahivtbwtldxtywu2
1500+ Motherhood Reels Bundle,"Emotional Reels, Family Reels, Kids &amp;amp, Motherhood Reels",jpsfatfzkpj3ldc0fuikz5q4guztooo9
2D Funny Animation Reels Bundle – Cartoon Comedy Videos,"Animation Reels, Comedy Reels",d09ujqkoj7msybmdhhvm32zx3fsw3gsu"""

import csv
import io

# Split raw into table 1 and table 2
parts = raw_csv.split("Product Title,Category,Access ID")
table1_str = parts[0].strip()
table2_str = ("Product Title,Category,Access ID\n" + parts[1].strip()) if len(parts) > 1 else ""

access_id_map = {}
if table2_str:
    reader2 = csv.DictReader(io.StringIO(table2_str))
    for row in reader2:
        title = row.get("Product Title", "").strip()
        access_id = row.get("Access ID", "").strip()
        if title and access_id:
            access_id_map[title] = access_id

print(f"Loaded {len(access_id_map)} Access IDs from Table 2")

reader1 = csv.reader(io.StringIO(table1_str))
header = next(reader1)

bundles = []
categories_set = set()

for idx, row in enumerate(reader1):
    if not row or not row[0].strip():
        continue
    title = row[0].strip()
    raw_cat = row[1].strip() if len(row) > 1 else "Other"
    
    # Clean category
    clean_cat = raw_cat.replace('&amp;amp', '').replace('&amp;', '&').strip()
    primary_cat = [c.strip() for c in clean_cat.split(',') if c.strip()][0] if clean_cat else "Other"
    categories_set.add(primary_cat)
    
    # Extract links
    links = []
    # Columns: 3: Part 1 - Link, 4: Label, 5: Part 2 - Link, 6: Label...
    col = 3
    while col < len(row):
        link = row[col].strip() if col < len(row) else ""
        label = row[col+1].strip() if col+1 < len(row) else f"Part {((col-3)//2)+1}"
        if link:
            links.append({"label": label or "Bundle Access Link", "url": link})
        col += 2
        
    # If no links in table 1, check access_id_map
    if not links and title in access_id_map:
        acc_id = access_id_map[title]
        # In vaultzet / delivery systems, access id link
        links.append({"label": "Instant Cloud Access", "url": f"https://drive.google.com/drive/u/0/folders/{acc_id}"})
    elif not links:
        links.append({"label": "Bundle Access Link", "url": "https://drive.google.com/drive/folders/1Ykmi_mcwvChCkcL1hMtEdW6AJAW3reVU"})

    # Extract clip count from title (e.g. 1000+, 1,400+, 200+)
    count_match = re.search(r'([\d,]+\+?)', title)
    clip_count = count_match.group(1) + " Reels" if count_match else "1,000+ Reels"

    bundles.append({
        "id": f"bundle-{idx+1}",
        "title": title,
        "category": primary_cat,
        "allCategories": clean_cat,
        "clipCount": clip_count,
        "links": links,
        "primaryLink": links[0]["url"] if links else ""
    })

print(f"Total processed bundles: {len(bundles)}")
print(f"Unique categories ({len(categories_set)}): {sorted(list(categories_set))}")
