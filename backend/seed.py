"""
Seed script for Alatau SuperApp.
Run: python seed.py
"""

import uuid
from datetime import datetime, timezone, timedelta

from database import SessionLocal, engine, Base
from models.project import ProjectCard
from models.notification import Notification
from models.sensor import Sensor
from models.poll import Poll, PollOption


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ---- Projects ----
    projects = [
        ProjectCard(
            id=str(uuid.uuid4()),
            title="SOM Landmark Tower Complex",
            description="Construction of the 272m, 56-floor landmark tower designed by SOM in the Gate District. Mixed-use CBD nucleus with offices, residences, and retail.",
            institution="Alatau City Development",
            project_type="commercial",
            status="planned",
            completion_pct=12,
            start_date="2024-06-01",
            end_date="2029-12-31",
            apartments=None,
            image_url="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80",
            lat=43.6743,
            lon=77.1082,
        ),
        ProjectCard(
            id=str(uuid.uuid4()),
            title="A3 Highway Expansion — Almaty to Alatau",
            description="Widening the A3 corridor from 4 to 8 lanes between Almaty city limits and Alatau Gate District.",
            institution="Almaty Region Akimat",
            project_type="infrastructure",
            status="active",
            completion_pct=55,
            start_date="2023-03-15",
            end_date="2025-09-30",
            apartments=None,
            image_url="https://images.unsplash.com/photo-1545483656-1a34ae73add1?w=900&q=80",
            lat=43.4650,
            lon=77.0200,
        ),
        ProjectCard(
            id=str(uuid.uuid4()),
            title="Alatau International Airport",
            description="New international airport in the Growing District with capacity up to 40 million passengers/year.",
            institution="Alatau City Development",
            project_type="infrastructure",
            status="planned",
            completion_pct=8,
            start_date="2025-01-01",
            end_date="2030-06-30",
            apartments=None,
            image_url="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80",
            lat=43.7100,
            lon=77.0500,
        ),
        ProjectCard(
            id=str(uuid.uuid4()),
            title="Golden District University Campus",
            description="Higher education and research campus in the Golden District. Science labs, medical cluster, student housing for 15,000 students.",
            institution="Alatau City Development",
            project_type="education",
            status="planned",
            completion_pct=22,
            start_date="2024-09-01",
            end_date="2028-08-31",
            apartments=None,
            image_url="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=80",
            lat=43.6900,
            lon=77.1300,
        ),
        ProjectCard(
            id=str(uuid.uuid4()),
            title="Kapchagay Reservoir Resort Complex",
            description="Year-round integrated resort and tourism cluster in the Green District near Kapchagay Reservoir. Hotels, water parks, and marina facilities.",
            institution="Qonaev City Akimat",
            project_type="tourism",
            status="active",
            completion_pct=68,
            start_date="2022-05-01",
            end_date="2025-12-31",
            apartments=420,
            image_url="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=900&q=80",
            lat=43.8300,
            lon=77.0800,
        ),
        ProjectCard(
            id=str(uuid.uuid4()),
            title="Smart Traffic System — Gate District",
            description="AI-powered adaptive traffic signals and sensor network across 120 intersections. Real-time congestion management and autonomous vehicle readiness.",
            institution="Alatau City Development",
            project_type="tech",
            status="active",
            completion_pct=83,
            start_date="2023-01-10",
            end_date="2024-12-31",
            apartments=None,
            image_url="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=900&q=80",
            lat=43.6750,
            lon=77.1150,
        ),
        ProjectCard(
            id=str(uuid.uuid4()),
            title="Alatau–Qonaev Light Rail",
            description="15km light rail connecting Alatau City center to Qonaev station, with 8 stops. Integrated with existing Turksib railway line.",
            institution="Almaty Region Akimat",
            project_type="infrastructure",
            status="planned",
            completion_pct=5,
            start_date="2026-01-01",
            end_date="2029-06-30",
            apartments=None,
            image_url="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=900&q=80",
            lat=43.7700,
            lon=77.0850,
        ),
        ProjectCard(
            id=str(uuid.uuid4()),
            title="CryptoCity Blockchain Hub",
            description="Free economic zone tech campus for blockchain, fintech, and Web3 companies. Visa-free access zone with dedicated data center.",
            institution="Alatau City Development",
            project_type="tech",
            status="active",
            completion_pct=41,
            start_date="2023-07-01",
            end_date="2026-06-30",
            apartments=None,
            image_url="https://images.unsplash.com/photo-1639322537228-f710d846310a?w=900&q=80",
            lat=43.6800,
            lon=77.1000,
        ),
        ProjectCard(
            id=str(uuid.uuid4()),
            title="Ile-Alatau Eco-Tourism Trail Network",
            description="120km network of hiking and cycling trails connecting Alatau City to Ile-Alatau National Park. Includes rest stations and EV charging.",
            institution="Almaty Region Akimat",
            project_type="tourism",
            status="planned",
            completion_pct=15,
            start_date="2025-04-01",
            end_date="2027-10-31",
            apartments=None,
            image_url="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80",
            lat=43.4000,
            lon=77.0500,
        ),
        ProjectCard(
            id=str(uuid.uuid4()),
            title="Growing District Logistics Park",
            description="Export-oriented manufacturing and logistics zone with warehousing, customs processing, and rail freight terminal.",
            institution="Alatau City Development",
            project_type="industrial",
            status="active",
            completion_pct=60,
            start_date="2022-11-01",
            end_date="2025-06-30",
            apartments=None,
            image_url="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=80",
            lat=43.7200,
            lon=77.0300,
        ),
    ]

    # ---- Notifications ----
    now = datetime.now(timezone.utc)
    notifications = [
        Notification(
            id=str(uuid.uuid4()),
            type="DANGER",
            title="Construction zone hazard on A3 near Zhetygen",
            body="Heavy machinery active on A3 highway km 38-42. Lane closures and reduced speed limits.",
            lat=43.6500,
            lon=77.0900,
            created_at=now - timedelta(hours=2),
        ),
        Notification(
            id=str(uuid.uuid4()),
            type="JAM",
            title="Traffic congestion — A3 Almaty exit",
            body="Heavy traffic on A3 at the Almaty city limits due to construction vehicles. Expect 25-min delays.",
            lat=43.3500,
            lon=76.9800,
            created_at=now - timedelta(hours=1),
        ),
        Notification(
            id=str(uuid.uuid4()),
            type="POLL",
            title="Poll: Public transit priority for Alatau City?",
            body="Should Alatau City prioritize light rail or BRT for the Gate-Golden district corridor?",
            lat=43.6800,
            lon=77.1200,
            created_at=now - timedelta(minutes=30),
        ),
        Notification(
            id=str(uuid.uuid4()),
            type="DANGER",
            title="Dust storm warning — Growing District",
            body="Construction-related dust advisory. PM2.5 levels elevated. Wear masks outdoors.",
            lat=43.7200,
            lon=77.0300,
            created_at=now - timedelta(hours=4),
        ),
        Notification(
            id=str(uuid.uuid4()),
            type="JAM",
            title="Qonaev bridge congestion",
            body="Weekend traffic buildup on the Ili River bridge. Resort visitors advised to use the eastern bypass.",
            lat=43.8550,
            lon=77.0650,
            created_at=now - timedelta(minutes=45),
        ),
        Notification(
            id=str(uuid.uuid4()),
            type="POLL",
            title="Poll: CryptoCity visa-free zone — support?",
            body="The proposed CryptoCity SEZ would offer visa-free entry for tech workers and investors.",
            lat=43.6800,
            lon=77.1000,
            created_at=now,
        ),
        Notification(
            id=str(uuid.uuid4()),
            type="DANGER",
            title="Water main break near Golden District",
            body="Temporary water supply disruption in the Golden District construction area. Estimated restoration: 6 hours.",
            lat=43.6900,
            lon=77.1350,
            created_at=now - timedelta(hours=6),
        ),
    ]

    # ---- Sensors ----
    sensors = [
        Sensor(id=str(uuid.uuid4()), name="Gate District Central", aqi=45, pm25=12.1, lat=43.6743, lon=77.1082, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="Gate District North", aqi=52, pm25=15.3, lat=43.6800, lon=77.1150, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="Golden District Campus", aqi=38, pm25=9.4, lat=43.6900, lon=77.1300, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="Growing District Industrial", aqi=135, pm25=52.8, lat=43.7200, lon=77.0300, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="Green District Lakeside", aqi=28, pm25=6.2, lat=43.8300, lon=77.0800, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="Qonaev City Center", aqi=62, pm25=18.7, lat=43.8642, lon=77.0633, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="A3 Highway Midpoint", aqi=88, pm25=31.5, lat=43.4650, lon=77.0200, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="Almaty North Exit", aqi=95, pm25=34.2, lat=43.3500, lon=76.9800, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="Alatau Airport Zone", aqi=110, pm25=43.6, lat=43.7100, lon=77.0500, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="Ile-Alatau Foothills", aqi=22, pm25=4.8, lat=43.2000, lon=77.0500, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="Kapchagay Reservoir East", aqi=30, pm25=7.1, lat=43.8500, lon=77.2000, recorded_at=now),
        Sensor(id=str(uuid.uuid4()), name="CryptoCity Hub", aqi=48, pm25=13.5, lat=43.6800, lon=77.1000, recorded_at=now),
    ]

    # ---- Polls ----
    polls_data = [
        {
            "title": "Public transit priority for Alatau City?",
            "description": "As the Gate and Golden districts grow, which transit system should be prioritized?",
            "lat": 43.6800, "lon": 77.1200,
            "options": ["Light Rail", "Bus Rapid Transit (BRT)", "Subway Extension", "Bike Lane Network"],
            "votes": [124, 87, 203, 56],
        },
        {
            "title": "CryptoCity visa-free zone — do you support it?",
            "description": "The proposed CryptoCity SEZ would offer visa-free entry for tech workers and investors.",
            "lat": 43.6800, "lon": 77.1000,
            "options": ["Yes, fully support", "Support with restrictions", "Need more information", "Against"],
            "votes": [312, 178, 95, 44],
        },
        {
            "title": "Extend Almaty Metro to Alatau City?",
            "description": "Should the existing Almaty Metro be extended along the A3 corridor to connect with Alatau City?",
            "lat": 43.4650, "lon": 77.0200,
            "options": ["Yes, top priority", "Yes, but after 2030", "No, invest in BRT instead", "No opinion"],
            "votes": [445, 167, 89, 32],
        },
        {
            "title": "Green District resort — what should be the focus?",
            "description": "The Green District near Kapchagay Reservoir is being planned as a tourism hub.",
            "lat": 43.8300, "lon": 77.0800,
            "options": ["Water sports & marina", "Eco-tourism & nature trails", "Hotels & entertainment", "Family parks"],
            "votes": [156, 234, 98, 189],
        },
        {
            "title": "Should Alatau City ban cars in the Gate District CBD?",
            "description": "Some planners propose making the Gate District core a pedestrian-only zone.",
            "lat": 43.6743, "lon": 77.1082,
            "options": ["Yes, fully pedestrian", "Partial — weekends only", "No, allow cars with restrictions", "Keep open"],
            "votes": [267, 198, 134, 78],
        },
    ]

    polls = []
    for pd in polls_data:
        poll = Poll(
            id=str(uuid.uuid4()),
            title=pd["title"],
            description=pd["description"],
            lat=pd["lat"],
            lon=pd["lon"],
        )
        for text, vote_count in zip(pd["options"], pd["votes"]):
            poll.options.append(PollOption(id=str(uuid.uuid4()), text=text, votes=vote_count))
        polls.append(poll)

    db.add_all(projects)
    db.add_all(notifications)
    db.add_all(sensors)
    db.add_all(polls)
    db.commit()
    db.close()

    print(f"Seeded {len(projects)} projects, {len(notifications)} notifications, {len(sensors)} sensors, {len(polls)} polls.")


if __name__ == "__main__":
    seed()
