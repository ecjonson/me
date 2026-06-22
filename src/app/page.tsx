export default function Home() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-24">
            <section className="mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Evan Jonson
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Computer scientist and graphics researcher and programmer.
                </p>
            </section>

            <section className="mb-16">
                <h2 className="mb-4 text-xl font-semibold">About</h2>
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                    Master of Science in Computer Science student at North Carolina State University,
                    conducting thesis research in the Visual Experience Lab at NCSU under Dr. Benjamin Watson.
                    My work focuses on designing, prototyping and evaluating a novel, near-zero latency display
                    system.
                    <br/><br/>
                    I have a broad and versatile computer science background with hands-on experience in
                    Machine Learning, Data Analysis, Cyber Security, Embedded Systems, Software Engineering,
                    Web Design, Networking, and Computer Graphics, supported by a deep understanding of computer
                    science theory and principles.
                </p>
            </section>

            {/* <section className="mb-16">
                <h2 className="mb-4 text-xl font-semibold">Projects</h2>
                <ul className="space-y-4">
                    <li className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                        <h3 className="font-medium">Project name</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            One line on what it is and what you built it with.
                        </p>
                    </li>
                </ul>
            </section> */}

            <section>
                <h2 className="mb-4 text-xl font-semibold">Contact</h2>
                <div className="flex gap-4 text-sm">
                    <a href="mailto:evancjonson@gmail.com" className="text-blue-600 hover:underline dark:text-blue-400">
                        Email
                    </a>
                    <a href="https://www.linkedin.com/in/evan-jonson/" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank">
                        LinkedIn
                    </a>
                    <a href="https://github.com/ecjonson" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank">
                        GitHub
                    </a>
                </div>
            </section>
        </main>
    );
}
