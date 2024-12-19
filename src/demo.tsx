import React from 'react';
import ReactDOM from 'react-dom/client';
import { ScrollerCoaster } from '.';

const App: React.FC = () => {
    return (
        <>
            <div>
                <h6>Vertical scrolling</h6>
                <ScrollerCoaster
                    style={{
                        width: 400,
                        height: 400,
                        border: '1px solid blue',
                    }}
                    horizontalTrackProps={{
                        showMode: 'always',
                    }}
                    verticalTrackProps={{
                        showMode: 'always',
                    }}
                >
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perferendis quasi sapiente culpa, iure
                    quisquam quam fugit ea? Accusamus minima architecto molestias, dolore at repellat eius quaerat cum
                    iure illum provident. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Culpa, iure.
                    Repellat, molestiae magni. Nam delectus et odio praesentium nisi repellendus sint voluptates illum
                    magnam tenetur, expedita sapiente cum fugit commodi. Lorem ipsum dolor, sit amet consectetur
                    adipisicing elit. Quidem repellendus porro vitae, velit nulla aut dolor quibusdam quos sed rem in et
                    delectus, reiciendis, quasi sunt. Corrupti vitae perspiciatis ducimus! Lorem ipsum dolor sit amet
                    consectetur adipisicing elit. Quaerat asperiores quisquam officia tempore. Dolorum amet optio libero
                    illo asperiores similique cum quisquam? Ullam repellendus cupiditate atque sit corporis incidunt
                    dolorem. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed assumenda aliquid amet, iste,
                    dolores magnam non molestiae incidunt ad inventore animi vel ipsum ab nemo atque sunt in? Officia,
                    optio. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Magnam sunt nisi, ea suscipit ipsam
                    laboriosam, quisquam similique explicabo libero eos, repellat in sequi ut sint quod iure repellendus
                    odio alias! Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora inventore dicta
                    explicabo ipsam necessitatibus nemo a eaque vitae, neque amet est iste minus excepturi, magnam quo
                    placeat nobis expedita odio. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus
                    placeat sapiente est numquam porro dolor perferendis id recusandae magnam eos, veritatis corporis
                    pariatur rem saepe autem veniam dolorum aperiam unde. Lorem ipsum, dolor sit amet consectetur
                    adipisicing elit. Nostrum placeat recusandae quo, hic velit ex. Modi suscipit ut hic voluptatum
                    delectus rerum ea ipsam adipisci inventore. Dignissimos, tempore! Neque, similique. Lorem ipsum
                    dolor sit amet, consectetur adipisicing elit. Dignissimos aut, expedita quibusdam nemo autem
                    recusandae possimus fugit, eligendi, facilis optio quae harum alias molestias inventore. Temporibus
                    provident iste officiis quaerat! Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestiae
                    et facilis possimus adipisci rerum, laboriosam ab ad eos error laudantium reiciendis ullam esse id
                    animi deserunt architecto ea saepe explicabo. Lorem ipsum dolor sit amet consectetur adipisicing
                    elit. Quis rerum eaque quos atque ipsam ad quia nisi asperiores incidunt ullam ipsum minima natus
                    quas, qui autem, ratione consequuntur non sunt.
                </ScrollerCoaster>
            </div>
            <div>
                <h6>Horizontal scrolling</h6>
                <ScrollerCoaster
                    style={{
                        width: 400,
                        border: '1px solid blue',
                        whiteSpace: 'nowrap',
                    }}
                    horizontalTrackProps={{
                        showMode: 'always',
                    }}
                    verticalTrackProps={{
                        showMode: 'always',
                    }}
                >
                    <div>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perferendis quasi sapiente culpa, iure
                        quisquam quam fugit ea? Accusamus minima architecto molestias, dolore at repellat eius quaerat
                        cum iure illum provident. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Culpa, iure.
                    </div>
                    <div>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minima ea nulla perferendis placeat
                        saepe officiis beatae rerum laboriosam quas, enim nihil eaque soluta distinctio sit nemo
                        delectus unde necessitatibus ab.
                    </div>
                </ScrollerCoaster>
            </div>
        </>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
